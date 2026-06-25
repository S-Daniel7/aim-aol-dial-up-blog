import type { LiveFeedEntry } from "@/lib/types";
import {
  formatEstClock,
  formatEstDayHeading,
  formatRelativeShort,
} from "@/lib/live-feed-time";
import Image from "next/image";

function groupByEstDay(entries: LiveFeedEntry[]) {
  const groups: { heading: string; items: LiveFeedEntry[] }[] = [];
  for (const e of entries) {
    const heading = formatEstDayHeading(e.created_at);
    const last = groups[groups.length - 1];
    if (last && last.heading === heading) {
      last.items.push(e);
    } else {
      groups.push({ heading, items: [e] });
    }
  }
  return groups;
}

function EntryBody({ entry }: { entry: LiveFeedEntry }) {
  return (
    <div className="min-w-0 flex-1 space-y-2">
      {entry.image_url ? (
        <div className="relative inline-block max-w-full border border-border bg-page-bg p-1">
          <Image
            src={entry.image_url}
            alt=""
            width={520}
            height={400}
            className="h-auto max-w-full object-contain"
            sizes="(max-width: 768px) 100vw, 520px"
          />
        </div>
      ) : null}
      {entry.body ? (
        <p className="text-sm leading-relaxed text-text">{entry.body}</p>
      ) : null}
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="border border-border bg-surface px-1.5 py-0 font-mono text-[10px] text-muted"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function LiveFeedStream({
  entries,
  pinned = [],
  author,
}: {
  entries: LiveFeedEntry[];
  pinned?: LiveFeedEntry[];
  author: string;
}) {
  const groups = groupByEstDay(entries);
  const isEmpty = entries.length === 0 && pinned.length === 0;

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-8 flex items-center gap-2 text-sm text-muted">
        <span className="online-dot" />
        <span className="font-semibold text-text">{author}</span>
        <span className="text-muted"> · times in Eastern (US)</span>
      </p>

      {isEmpty ? (
        <p className="text-sm text-muted">No updates yet.</p>
      ) : (
        <div className="space-y-12">
          {/* Pinned entries */}
          {pinned.length > 0 && (
            <section>
              <h1 className="mb-8 font-sans text-sm font-bold uppercase tracking-wide text-text flex items-center gap-2">
                ★ pinned
              </h1>
              <div className="space-y-0.7">
                {pinned.map((entry, itemIdx) => (
                  <article
                    key={entry.id}
                    className="animate-slide-in flex gap-6 sm:gap-3"
                    style={{ animationDelay: `${itemIdx * 0.05}s` }}
                  >
                    <div className="w-[4.5rem] shrink-0 sm:w-24">
                      <div className="text-[11px] leading-snug text-muted sm:text-xs">
                        {formatRelativeShort(entry.created_at)}
                      </div>
                      <div className="mt-0.5 text-[11px] leading-snug text-muted sm:text-xs">
                        {formatEstClock(entry.created_at)}
                      </div>
                      <div className="mt-1 font-mono text-[10px] text-accent opacity-80 sm:text-[11px]">
                        ★
                      </div>
                    </div>
                    <EntryBody entry={entry} />
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Regular grouped entries */}
          {groups.map((g) => (
            <section key={g.heading}>
              <h1 className="mb-8 font-sans text-sm font-bold uppercase tracking-wide text-text">
                {g.heading.toUpperCase()}
              </h1>
              <div className="space-y-0.7">
                {g.items.map((entry, itemIdx) => (
                  <article
                    key={entry.id}
                    className="animate-slide-in flex gap-6 sm:gap-3"
                    style={{ animationDelay: `${itemIdx * 0.05}s` }}
                  >
                    <div className="w-[4.5rem] shrink-0 sm:w-24">
                      <div className="text-[11px] leading-snug text-muted sm:text-xs">
                        {formatRelativeShort(entry.created_at)}
                      </div>
                      <div className="mt-0.5 text-[11px] leading-snug text-muted sm:text-xs">
                        {formatEstClock(entry.created_at)}
                      </div>
                      <div className="mt-1 font-mono text-[10px] text-muted opacity-70 sm:text-[11px]">
                        {Number(entry.feed_number)}
                      </div>
                    </div>
                    <EntryBody entry={entry} />
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
