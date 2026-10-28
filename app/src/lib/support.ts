import { join } from "node:path";
import { dataRoot } from "./platform";

/**
 * Unravel's data directory: renames, bookmarks, notes, saved threads and settings.
 * `UNRAVEL_SUPPORT` (or `ELEVEN_SUPPORT`) overrides it, so tests can point at a throwaway dir and never
 * touch the user's real data.
 */
export function supportDir(): string {
  return process.env.UNRAVEL_SUPPORT ?? process.env.ELEVEN_SUPPORT ?? dataRoot();
}

export function supportPath(...parts: readonly string[]): string {
  return join(supportDir(), ...parts);
}
