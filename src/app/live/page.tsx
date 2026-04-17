import { LiveFeedStream } from "@/components/LiveFeedStream";
import { getSupabasePublicConfig } from "@/lib/env";
import { getLiveFeedAuthor } from "@/lib/live-feed-author";
import { fetchLiveFeedEntries } from "@/lib/live-feed-db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live",
  description: "Status stream",
};

export default async function LivePage() {
  const configured = !!getSupabasePublicConfig();
  const entries = configured ? await fetchLiveFeedEntries() : [];
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
      <LiveFeedStream entries={entries} author={author} />
    </div>
  );
}
