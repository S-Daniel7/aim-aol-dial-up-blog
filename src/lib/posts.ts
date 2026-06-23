import { createPublicClient } from "@/lib/supabase/public";
import type { DbMessage, DbPost } from "@/lib/types";

export async function fetchPosts(): Promise<DbPost[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("posts")
    .select("id,title,slug,blurb,created_at")
    .order("created_at", { ascending: false });
  return (data as DbPost[]) ?? [];
}

export async function fetchPostBySlug(
  slug: string,
): Promise<{ post: DbPost; messages: DbMessage[] } | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data: post } = await supabase
    .from("posts")
    .select("id,title,slug,blurb,created_at")
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
    .select("created_at")
    .order("created_at", { ascending: true });
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as { created_at: string }[]) {
    const date = row.created_at.slice(0, 10);
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
