# Installs Unravel for the current Windows user.
#
#   irm https://unravel.chizi.app/install.ps1 | iex
#
# Set UNRAVEL_RELEASE_URL to install a specific zip (local path or URL) instead.
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$Repo = if ($env:UNRAVEL_REPO) { $env:UNRAVEL_REPO } elseif ($env:ELEVEN_REPO) { $env:ELEVEN_REPO } else { "aryanchauhan3800/Unravel" }
$Mirror = if ($env:UNRAVEL_MIRROR) { $env:UNRAVEL_MIRROR } elseif ($env:ELEVEN_MIRROR) { $env:ELEVEN_MIRROR } else { $null }
$Dest = if ($env:UNRAVEL_DEST) { $env:UNRAVEL_DEST } elseif ($env:ELEVEN_DEST) { $env:ELEVEN_DEST } else { Join-Path $env:LOCALAPPDATA "Programs\Unravel" }

function Find-Release {
  if ($Mirror) {
    try {
      $version = (Invoke-RestMethod "$Mirror/latest.json").version
      $url = "$Mirror/v$version/Unravel-$version-windows-x64.zip"
      Invoke-WebRequest $url -Method Head -UseBasicParsing | Out-Null
      return $url
    } catch {}
  }
  try {
    $release = Invoke-RestMethod "https://api.github.com/repos/$Repo/releases/latest"
    return ($release.assets | Where-Object { $_.name -like "Unravel-*-windows-x64.zip" } | Select-Object -First 1).browser_download_url
  } catch {}
  return $null
}

$url = if ($env:UNRAVEL_RELEASE_URL) { $env:UNRAVEL_RELEASE_URL } else { $env:ELEVEN_RELEASE_URL }
if (-not $url) {
  Write-Host "Finding the latest Unravel release..."
  $url = Find-Release
}
if (-not $url) {
  Write-Error "No Windows release found. Set UNRAVEL_RELEASE_URL to a zip."
}

$tmp = Join-Path ([IO.Path]::GetTempPath()) ("unravel-" + [Guid]::NewGuid())
New-Item -ItemType Directory -Path $tmp | Out-Null
try {
  $zip = Join-Path $tmp "unravel.zip"
  Write-Host "Downloading $url"
  if ($url -match "^https?://") { Invoke-WebRequest $url -OutFile $zip -UseBasicParsing } else { Copy-Item $url $zip }
  Expand-Archive $zip -DestinationPath $tmp -Force

  Write-Host "Installing to $Dest"
  Get-Process Unravel -ErrorAction SilentlyContinue | Stop-Process -Force
  Get-Process Eleven -ErrorAction SilentlyContinue | Stop-Process -Force
  if (Test-Path $Dest) { Remove-Item $Dest -Recurse -Force }
  New-Item -ItemType Directory -Path (Split-Path $Dest) -Force | Out-Null
  Move-Item (Join-Path $tmp "Unravel") $Dest
} finally {
  Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
}

$exe = Join-Path $Dest "bin\Unravel.exe"
$shortcut = (New-Object -ComObject WScript.Shell).CreateShortcut((Join-Path ([Environment]::GetFolderPath("Programs")) "Unravel.lnk"))
$shortcut.TargetPath = $exe
$shortcut.WorkingDirectory = Split-Path $exe
$shortcut.Save()

Write-Host "Installed. Eleven is in the Start menu."
if (-not $env:ELEVEN_NO_LAUNCH) { Start-Process $exe }
