import type { LiveFeedEntry } from "@/lib/types";
import { formatRelativeShort } from "@/lib/live-feed-time";
import Link from "next/link";

export function RecentThoughts({ entries }: { entries: LiveFeedEntry[] }) {
  if (!entries.length) return null;

  return (
    <div
      className="border-2 border-border bg-surface"
      style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
    >
      <div
        className="flex items-center justify-between border-b-2 border-border bg-title-bar px-3 py-2"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <span className="font-heading text-lg text-title-bar-text">recent thoughts</span>
        <Link
          href="/live"
          className="font-mono text-[10px] text-title-bar-text opacity-70 no-underline hover:opacity-100"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          all entries →
        </Link>
      </div>
      <div className="divide-y divide-border">
        {entries.map((entry) => (
          <div key={entry.id} className="flex gap-4 px-3 py-2.5">
            <span
              className="shrink-0 font-mono text-[10px] text-muted pt-0.5 w-14"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >
              {formatRelativeShort(entry.created_at)}
            </span>
            <p className="text-sm text-text leading-relaxed min-w-0">
              {entry.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
