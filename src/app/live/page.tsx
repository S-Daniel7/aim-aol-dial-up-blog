import { LiveFeedCalendar } from "@/components/LiveFeedCalendar";
import { LiveFeedStream } from "@/components/LiveFeedStream";
import { getSupabasePublicConfig } from "@/lib/env";
import { getLiveFeedAuthor } from "@/lib/live-feed-author";
import { fetchLiveFeedCountsByDate, fetchLiveFeedEntries, fetchLiveFeedPage, fetchLiveFeedTags } from "@/lib/live-feed-db";
import { formatEstDateKey } from "@/lib/live-feed-time";
import type { LiveFeedEntry } from "@/lib/types";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live",
  description: "Status stream",
};

const PAGE_SIZE = 20;

type Props = {
  searchParams: Promise<{ date?: string; month?: string; tag?: string; page?: string }>;
};

function cleanDateParam(value: string | undefined) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function cleanTag(value: string | undefined) {
  const t = (value ?? "").trim().toLowerCase();
  return t.length > 0 && t.length <= 30 ? t : null;
}

export default async function LivePage({ searchParams }: Props) {
  const configured = !!getSupabasePublicConfig();
  const params = await searchParams;
  const selectedDate = cleanDateParam(params.date);
  const displayMonth = selectedDate ?? cleanDateParam(params.month);
  const activeTag = cleanTag(params.tag);
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const author = getLiveFeedAuthor();

  const [countsByDate, allTags] = configured
    ? await Promise.all([fetchLiveFeedCountsByDate(), fetchLiveFeedTags()])
    : [{} as Record<string, number>, [] as string[]];

  const availableDates = Object.keys(countsByDate).sort();

  let entries: LiveFeedEntry[] = [];
  let pinned: LiveFeedEntry[] = [];
  let total = 0;

  if (configured) {
    if (selectedDate) {
      const all = await fetchLiveFeedEntries({ tag: activeTag });
      entries = all.filter((e) => formatEstDateKey(e.created_at) === selectedDate);
      total = entries.length;
    } else {
      const result = await fetchLiveFeedPage({ page, tag: activeTag });
      entries = result.entries;
      pinned = result.pinned;
      total = result.total;
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function pageHref(p: number) {
    const q = new URLSearchParams();
    if (activeTag) q.set("tag", activeTag);
    if (p > 1) q.set("page", String(p));
    const qs = q.toString();
    return `/live${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      {!configured ? (
        <div className="mb-8 border-2 border-border bg-surface p-4 text-sm">
          <p className="font-semibold text-accent">Supabase not configured</p>
          <p className="mt-2 text-muted">
            Add env keys and run the live feed section from{" "}
            <code className="border border-border bg-page-bg px-1">supabase/schema.sql</code>.
          </p>
        </div>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
        <LiveFeedCalendar
          availableDates={availableDates}
          displayMonth={displayMonth}
          selectedDate={selectedDate}
        />
        <div className="space-y-6">
          {/* Tag filter pills */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <Link
                href="/live"
                className={`border px-2 py-0.5 font-mono text-[11px] no-underline transition-colors ${
                  !activeTag
                    ? "border-accent bg-accent text-accent-contrast"
                    : "border-border bg-surface text-muted hover:text-text"
                }`}
                style={{ fontFamily: "var(--font-mono-chat)" }}
              >
                all
              </Link>
              {allTags.map((tag) => (
                <Link
                  key={tag}
                  href={activeTag === tag ? "/live" : `/live?tag=${encodeURIComponent(tag)}`}
                  className={`border px-2 py-0.5 font-mono text-[11px] no-underline transition-colors ${
                    activeTag === tag
                      ? "border-accent bg-accent text-accent-contrast"
                      : "border-border bg-surface text-muted hover:text-text"
                  }`}
                  style={{ fontFamily: "var(--font-mono-chat)" }}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          <LiveFeedStream entries={entries} pinned={pinned} author={author} />

          {/* Pagination — only when not filtering by date */}
          {!selectedDate && totalPages > 1 && (
            <div className="flex items-center gap-4 border-t border-border pt-4">
              {page > 1 ? (
                <Link
                  href={pageHref(page - 1)}
                  className="font-mono text-sm text-link no-underline hover:text-link-hover"
                  style={{ fontFamily: "var(--font-mono-chat)" }}
                >
                  ← prev
                </Link>
              ) : <span />}
              <span
                className="font-mono text-xs text-muted mx-auto"
                style={{ fontFamily: "var(--font-mono-chat)" }}
              >
                page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={pageHref(page + 1)}
                  className="font-mono text-sm text-link no-underline hover:text-link-hover"
                  style={{ fontFamily: "var(--font-mono-chat)" }}
                >
                  next →
                </Link>
              ) : <span />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
