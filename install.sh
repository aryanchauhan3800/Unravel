#!/usr/bin/env bash
# Installs Unravel into /Applications.
#
#   curl -fsSL https://unravel.chizi.app/install.sh | bash
#
# It downloads the latest release zip for this Mac's architecture, unzips it,
# and opens it. The app is signed and notarized; Java and Ghidra download on first launch. Set
# ELEVEN_RELEASE_URL to install a specific zip (local path or URL) instead.
set -euo pipefail

REPO="${UNRAVEL_REPO:-${ELEVEN_REPO:-aryanchauhan3800/Unravel}}"
MIRROR="${UNRAVEL_MIRROR:-${ELEVEN_MIRROR:-}}"
DEST="${UNRAVEL_DEST:-${ELEVEN_DEST:-${DEST:-/Applications}}}"
arch="$(uname -m)"

if [ "$(uname -s)" != "Darwin" ]; then
  echo "Unravel is macOS only for now." >&2
  exit 1
fi

url="${UNRAVEL_RELEASE_URL:-${ELEVEN_RELEASE_URL:-}}"
if [ -z "$url" ] && [ -n "$MIRROR" ]; then
  echo "Finding the latest Unravel release from mirror…"
  version="$(curl -fsSL "$MIRROR/latest.json" 2>/dev/null | grep -o '"version":"[^"]*"' | cut -d'"' -f4 || true)"
  if [ -n "$version" ]; then
    url="$MIRROR/v$version/Unravel-$version-$arch.zip"
    curl -fsIL "$url" > /dev/null 2>&1 || url=""
  fi
fi
if [ -z "$url" ]; then
  echo "Finding the latest Unravel release on GitHub…"
  url="$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" \
    | grep -o "https://[^\"]*Unravel-[^\"]*-$arch\.zip" | head -1 || true)"
fi
if [ -z "$url" ]; then
  echo "No Unravel release found for $arch on https://github.com/$REPO/releases." >&2
  echo "Please publish a release or set UNRAVEL_RELEASE_URL to a zip." >&2
  exit 1
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
echo "Downloading $url"
case "$url" in
  http*) curl -fSL "$url" -o "$tmp/unravel.zip" ;;
  *) cp "$url" "$tmp/unravel.zip" ;;
esac

echo "Installing to $DEST/Unravel.app"
rm -rf "$DEST/Unravel.app"
ditto -x -k "$tmp/unravel.zip" "$DEST"
xattr -dr com.apple.quarantine "$DEST/Unravel.app" 2>/dev/null || true

echo "Installed. Open it with: open \"$DEST/Unravel.app\""
open "$DEST/Unravel.app"
