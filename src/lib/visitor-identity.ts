import { generateScreenname } from "@/lib/screenname";

const KEY = "visitor-screenname";

/** Stable per-browser screen name, generated on first use and kept in localStorage. */
export function getVisitorName(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return existing;
    const name = generateScreenname();
    localStorage.setItem(KEY, name);
    return name;
  } catch {
    return generateScreenname();
  }
}
