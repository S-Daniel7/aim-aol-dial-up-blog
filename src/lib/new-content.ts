const PREFIX = "seen:";

/** ISO timestamp of the newest content the visitor has already seen for a page, if any. */
export function getSeen(href: string): string | null {
  try {
    return localStorage.getItem(PREFIX + href);
  } catch {
    return null;
  }
}

export function setSeen(href: string, iso: string): void {
  try {
    localStorage.setItem(PREFIX + href, iso);
  } catch {
    /* storage unavailable */
  }
}

/**
 * True when there is content newer than what the visitor last saw.
 * First-time visitors (nothing stored) never see a badge, so a new site
 * doesn't greet everyone with "new" on every link.
 */
export function hasNew(latest: string | null | undefined, seen: string | null): boolean {
  if (!latest || !seen) return false;
  return latest > seen;
}
