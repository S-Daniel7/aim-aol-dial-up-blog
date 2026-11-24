import { sanitize } from "@/lib/content-filter";

export const MAX_COMMENT_NAME = 40;
export const MAX_COMMENT_BODY = 500;

export type CommentInput =
  | { ok: true; authorName: string; body: string }
  | { ok: false; error: string };

/** Validate and clean a visitor comment. Pure so it can be unit-tested. */
export function validateComment(input: {
  author_name?: unknown;
  body?: unknown;
}): CommentInput {
  const rawName = typeof input.author_name === "string" ? input.author_name : "";
  const rawBody = typeof input.body === "string" ? input.body : "";
  const authorName = sanitize(rawName.trim());
  const body = sanitize(rawBody.trim());
  if (!authorName || authorName.length > MAX_COMMENT_NAME) {
    return { ok: false, error: `Name must be 1-${MAX_COMMENT_NAME} characters` };
  }
  if (!body || body.length > MAX_COMMENT_BODY) {
    return { ok: false, error: `Comment must be 1-${MAX_COMMENT_BODY} characters` };
  }
  return { ok: true, authorName, body };
}
