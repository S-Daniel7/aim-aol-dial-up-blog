import { createPublicClient } from "@/lib/supabase/public";
import type { LiveFeedEntry } from "@/lib/types";

export async function fetchLiveFeedCountsByDate(): Promise<Record<string, number>> {
  const supabase = createPublicClient();
  if (!supabase) return {};
  const { data } = await supabase
    .from("live_feed_entries")
    .select("created_at")
    .order("created_at", { ascending: true });
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as { created_at: string }[]) {
    const date = row.created_at.slice(0, 10);
    counts[date] = (counts[date] ?? 0) + 1;
  }
  return counts;
}

export async function fetchLiveFeedEntries(): Promise<LiveFeedEntry[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("live_feed_entries")
    .select("id,feed_number,body,image_url,created_at")
    .order("feed_number", { ascending: false });
  if (error || !data) return [];
  return (data as LiveFeedEntry[]).map((row) => ({
    ...row,
    image_url: row.image_url ?? null,
  }));
}
