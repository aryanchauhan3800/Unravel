import { switchView, type ViewName } from "../bridge/view";

const VIEWS: readonly ViewName[] = ["pseudocode", "assembly", "graph", "hex"];

export function isViewName(value: string): value is ViewName {
  return VIEWS.some((v) => v === value);
}

/** Handles an unravel:// URI from chat links or buttons, returning true if handled. */
export function handleUnravelUri(url: string, onOpen: (procedure: string) => void): boolean {
  if (!url.startsWith("unravel://")) return false;
  const path = url.slice("unravel://".length);
  const slash = path.indexOf("/");
  const kind = slash >= 0 ? path.slice(0, slash) : path;
  const target = slash >= 0 ? decodeURIComponent(path.slice(slash + 1)) : "";
  switch (kind) {
    case "procedure":
    case "function":
    case "address":
    case "xref":
    case "string":
      if (target) onOpen(target);
      return true;
    case "view":
      if (isViewName(target)) switchView(target);
      return true;
    default:
      if (target) onOpen(target);
      return true;
  }
}

/** Extracts procedure names and addresses from markdown links like [Foo](unravel://procedure/Foo). */
export function extractUnravelTargets(text: string): readonly string[] {
  const matches = text.matchAll(/unravel:\/\/(?:procedure|function|address)\/([A-Za-z0-9_#.-]+)/g);
  return [...new Set([...matches].map((m) => m[1]).filter((v): v is string => Boolean(v)))];
}

