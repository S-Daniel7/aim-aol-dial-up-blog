import { slugify } from "@/lib/slug";

const MAX_TAGS = 8;
const MAX_TAG_LENGTH = 32;

/** Normalise free-form tag input (comma/space separated or an array) into unique slugs. */
export function parseTags(input: unknown): string[] {
  const raw = Array.isArray(input)
    ? input.map(String)
    : typeof input === "string"
      ? input.split(/[,\n]/)
      : [];
  const seen = new Set<string>();
  for (const item of raw) {
    const tag = slugify(item.replace(/^#/, "")).slice(0, MAX_TAG_LENGTH);
    // slugify falls back to "post" for empty input, so skip blank source text.
    if (!item.trim() || !tag) continue;
    seen.add(tag);
    if (seen.size >= MAX_TAGS) break;
  }
  return [...seen];
}

/**
 * Parse an optional publish time. `undefined`/empty means "publish now" (null);
 * an unparseable value is reported as `{ error }` so callers can return a 400.
 */
export function parsePublishAt(
  input: unknown,
): { value: string | null } | { error: string } {
  if (input === undefined || input === null || input === "") {
    return { value: null };
  }
  if (typeof input !== "string") return { error: "Invalid publish time" };
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return { error: "Invalid publish time" };
  return { value: date.toISOString() };
}

/** Month key used by /archive/[month], e.g. "2026-11". */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function isValidMonthKey(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

/** First instant of the month and of the following month (UTC), for range queries. */
export function monthRange(key: string): { start: string; end: string } {
  const [y, m] = key.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));
  return { start: start.toISOString(), end: end.toISOString() };
}

/** Convert a stored ISO timestamp to the value format of <input type="datetime-local">. */
export function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
