import { createPublicClient } from "@/lib/supabase/public";
import type { DbMessage, DbPost } from "@/lib/types";
import { monthRange } from "@/lib/post-meta";

export const POST_COLUMNS =
  "id,title,slug,blurb,my_handle,created_at,publish_at,is_pinned,tags";

export async function fetchPosts(): Promise<DbPost[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("posts")
    .select(POST_COLUMNS)
    .order("is_pinned", { ascending: false })
    .order("publish_at", { ascending: false });
  return (data as DbPost[]) ?? [];
}

export async function fetchPostsByTag(tag: string): Promise<DbPost[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("posts")
    .select(POST_COLUMNS)
    .contains("tags", [tag])
    .order("publish_at", { ascending: false });
  return (data as DbPost[]) ?? [];
}

export async function fetchPostsByMonth(monthKey: string): Promise<DbPost[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { start, end } = monthRange(monthKey);
  const { data } = await supabase
    .from("posts")
    .select(POST_COLUMNS)
    .gte("publish_at", start)
    .lt("publish_at", end)
    .order("publish_at", { ascending: false });
  return (data as DbPost[]) ?? [];
}

export async function fetchPostBySlug(
  slug: string,
): Promise<{ post: DbPost; messages: DbMessage[] } | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data: post } = await supabase
    .from("posts")
    .select(POST_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (!post) return null;
  const { data: messages } = await supabase
    .from("messages")
    .select(
      "id,post_id,order_index,kind,sender,time_label,body,image_url,image_caption",
    )
    .eq("post_id", (post as DbPost).id)
    .order("order_index", { ascending: true });
  return {
    post: post as DbPost,
    messages: (messages as DbMessage[]) ?? [],
  };
}

export async function fetchPostCountsByDate(): Promise<Record<string, number>> {
  const supabase = createPublicClient();
  if (!supabase) return {};
  const { data } = await supabase
    .from("posts")
    .select("publish_at")
    .order("publish_at", { ascending: true });
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as { publish_at: string }[]) {
    const date = row.publish_at.slice(0, 10);
    counts[date] = (counts[date] ?? 0) + 1;
  }
  return counts;
}

export async function fetchMessagesForPosts(
  postIds: string[],
): Promise<Record<string, DbMessage[]>> {
  if (postIds.length === 0) return {};
  const supabase = createPublicClient();
  if (!supabase) return {};
  const { data: messages } = await supabase
    .from("messages")
    .select(
      "id,post_id,order_index,kind,sender,time_label,body,image_url,image_caption",
    )
    .in("post_id", postIds)
    .order("post_id", { ascending: true })
    .order("order_index", { ascending: true });
  const map: Record<string, DbMessage[]> = {};
  for (const id of postIds) map[id] = [];
  for (const m of (messages as DbMessage[]) ?? []) {
    if (!map[m.post_id]) map[m.post_id] = [];
    map[m.post_id].push(m);
  }
  return map;
}
