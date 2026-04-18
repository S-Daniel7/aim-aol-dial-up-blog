import { LiveFeedCalendar } from "@/components/LiveFeedCalendar";
import { LiveFeedStream } from "@/components/LiveFeedStream";
import { getSupabasePublicConfig } from "@/lib/env";
import { getLiveFeedAuthor } from "@/lib/live-feed-author";
import { fetchLiveFeedEntries } from "@/lib/live-feed-db";
import { formatEstDateKey } from "@/lib/live-feed-time";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live",
  description: "Status stream",
};

type Props = {
  searchParams: Promise<{ date?: string; month?: string }>;
};

function cleanDateParam(value: string | undefined) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export default async function LivePage({ searchParams }: Props) {
  const configured = !!getSupabasePublicConfig();
  const params = await searchParams;
  const selectedDate = cleanDateParam(params.date);
  const displayMonth = selectedDate ?? cleanDateParam(params.month);
  const allEntries = configured ? await fetchLiveFeedEntries() : [];
  const availableDates = Array.from(
    new Set(allEntries.map((entry) => formatEstDateKey(entry.created_at))),
  ).sort();
  const entries = selectedDate
    ? allEntries.filter(
        (entry) => formatEstDateKey(entry.created_at) === selectedDate,
      )
    : allEntries;
  const author = getLiveFeedAuthor();

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
        <LiveFeedStream entries={entries} author={author} />
      </div>
    </div>
  );
}
