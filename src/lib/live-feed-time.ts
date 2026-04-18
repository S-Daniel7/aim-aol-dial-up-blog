const EST = "America/New_York";

/** e.g. "8d ago" */
export function formatRelativeShort(iso: string): string {
  const t = new Date(iso).getTime();
  const now = Date.now();
  let sec = Math.round((now - t) / 1000);
  if (sec < 0) sec = 0;
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  if (wk < 8) return `${wk}w ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  const yr = Math.floor(day / 365);
  return `${yr}y ago`;
}

/** Clock time in Eastern Time, e.g. "7:50 AM" */
export function formatEstClock(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: EST,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

/** Calendar day label in EST for grouping, e.g. "Thursday, April 9, 2026" */
export function formatEstDayHeading(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: EST,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

/** EST calendar key, e.g. "2026-04-17", for date filtering. */
export function formatEstDateKey(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: EST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}`;
}
