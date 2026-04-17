/** Display name for the live feed (public env so it can be used on the client). */
export function getLiveFeedAuthor(): string {
  const v = process.env.NEXT_PUBLIC_LIVE_FEED_AUTHOR?.trim();
  return v || "me";
}
