import { createPublicClient } from "@/lib/supabase/public";
import { formatEstDateKey } from "@/lib/live-feed-time";
import type { LiveFeedEntry } from "@/lib/types";

const FIELDS = "id,feed_number,body,image_url,created_at,tags,is_pinned";
const FIELDS_COMPAT = "id,feed_number,body,image_url,created_at";
const PAGE_SIZE = 20;

function normalise(row: Record<string, unknown>): LiveFeedEntry {
  return {
    ...(row as LiveFeedEntry),
    image_url: (row.image_url as string | null) ?? null,
    tags: (row.tags as string[] | null) ?? [],
    is_pinned: (row.is_pinned as boolean | null) ?? false,
  };
}

export async function fetchLiveFeedCountsByDate(): Promise<Record<string, number>> {
  const supabase = createPublicClient();
  if (!supabase) return {};
  const { data } = await supabase
    .from("live_feed_entries")
    .select("created_at")
    .order("created_at", { ascending: true });
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as { created_at: string }[]) {
    // Use EST date so calendar dates match the stream's date filter
    const date = formatEstDateKey(row.created_at);
    counts[date] = (counts[date] ?? 0) + 1;
  }
  return counts;
}

export async function fetchLiveFeedTags(): Promise<string[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data } = await supabase.from("live_feed_entries").select("tags");
  if (!data) return [];
  return [
    ...new Set((data as { tags: string[] }[]).flatMap((r) => r.tags ?? [])),
  ].sort();
}

export async function fetchLiveFeedEntries(opts?: { tag?: string | null }): Promise<LiveFeedEntry[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  let q = supabase
    .from("live_feed_entries")
    .select(FIELDS)
    .order("feed_number", { ascending: false });
  if (opts?.tag) q = q.contains("tags", [opts.tag]);
  const { data, error } = await q;
  // Graceful fallback if migration 015 hasn't been run yet
  if (error) {
    const fb = await supabase
      .from("live_feed_entries")
      .select(FIELDS_COMPAT)
      .order("feed_number", { ascending: false });
    return ((fb.data ?? []) as Record<string, unknown>[]).map(normalise);
  }
  return (data as Record<string, unknown>[]).map(normalise);
}

export async function fetchLiveFeedPage(opts: {
  page?: number;
  tag?: string | null;
}): Promise<{ entries: LiveFeedEntry[]; total: number; pinned: LiveFeedEntry[] }> {
  const supabase = createPublicClient();
  if (!supabase) return { entries: [], total: 0, pinned: [] };

  const page = Math.max(1, opts.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Non-pinned, paginated
  let q = supabase
    .from("live_feed_entries")
    .select(FIELDS, { count: "exact" })
    .eq("is_pinned", false)
    .order("feed_number", { ascending: false })
    .range(from, to);
  if (opts.tag) q = q.contains("tags", [opts.tag]);

  // Pinned (always shown, filtered by tag if set)
  let pq = supabase
    .from("live_feed_entries")
    .select(FIELDS)
    .eq("is_pinned", true)
    .order("feed_number", { ascending: false });
  if (opts.tag) pq = pq.contains("tags", [opts.tag]);

  const [mainResult, pinnedResult] = await Promise.all([q, pq]);

  // Graceful fallback if migration 015 hasn't been run yet
  if (mainResult.error) {
    const fb = await supabase
      .from("live_feed_entries")
      .select(FIELDS_COMPAT, { count: "exact" })
      .order("feed_number", { ascending: false })
      .range(from, to);
    const entries = ((fb.data ?? []) as Record<string, unknown>[]).map(normalise);
    return { entries, total: fb.count ?? 0, pinned: [] };
  }

  const entries = ((mainResult.data ?? []) as Record<string, unknown>[]).map(normalise);
  const pinned = ((pinnedResult.data ?? []) as Record<string, unknown>[]).map(normalise);

  return { entries, total: mainResult.count ?? 0, pinned };
}

export async function fetchRecentLiveFeedEntries(limit = 3): Promise<LiveFeedEntry[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("live_feed_entries")
    .select(FIELDS)
    .order("feed_number", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map(normalise);
}
