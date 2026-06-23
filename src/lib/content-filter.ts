import leoProfanity from "leo-profanity";

// Additional hate speech / slur terms not always in the default list.
// Stored obfuscated as base64 so the source file itself isn't a slur index.
// Each entry is btoa("<term>") — decoded only at module init time.
const EXTRA_BLOCKED = [
  "bmln", // n-word (short)
  "bmlnZ2Vy", // n-word (full)
  "ZmFnZ290", // f-slur
  "ZmFn", // f-slur (short)
  "cmV0YXJk", // r-slur
  "Y3VudA==", // c-word
  "a2lrZQ==", // k-slur
  "c3BpYw==", // s-slur
  "Y2hvbms=", // c-slur
  "Z29vaw==", // g-slur
  "d29p", // w-slur
  "dHJhbm55", // trans slur
  "c2hla2Vs", // sh-slur
  "Y3Jpcms=", // cr-slur
  "Z3liYWNr", // slur combo
  "dHdpbms=", // tw-slur
  "aml6eg==", // j-slur
].map((b) => Buffer.from(b, "base64").toString("utf8"));

leoProfanity.add(EXTRA_BLOCKED);

/** Strip HTML tags and dangerous character sequences to prevent XSS. */
export function stripHtml(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "") // remove HTML tags
    .replace(/&(?:#\d+|#x[\da-f]+|[a-z]+);/gi, " ") // decode HTML entities to space
    .replace(/javascript\s*:/gi, "") // kill JS URIs
    .replace(/on\w+\s*=/gi, ""); // kill event handlers like onerror=
}

/**
 * Sanitize and filter a user-submitted string.
 * Strips HTML, then replaces profanity / hate speech with ***.
 * Returns the cleaned string.
 */
export function sanitize(raw: string): string {
  return leoProfanity.clean(stripHtml(raw));
}

/** Returns true if the string contains blocked words (after HTML stripping). */
export function containsBlocked(raw: string): boolean {
  return leoProfanity.check(stripHtml(raw));
}
