import { createPublicClient } from "@/lib/supabase/public";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ posts: [], messages: [] });
  }

  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({ posts: [], messages: [] });

  const query = q;

  const [postsRes, messagesRes] = await Promise.all([
    supabase
      .from("posts")
      .select("id, title, slug, blurb, created_at")
      .eq("visibility", "public")
      .textSearch("fts", query, { type: "websearch", config: "english" })
      .limit(8),

    supabase
      .from("messages")
      .select("post_id, body, sender, time_label, posts!inner(title, slug, visibility)")
      .eq("posts.visibility", "public")
      .textSearch("fts", query, { type: "websearch", config: "english" })
      .limit(10),
  ]);

  const posts = (postsRes.data ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    blurb: p.blurb,
  }));

  const messages = (messagesRes.data ?? [])
    .filter((m) => m.body)
    .map((m) => {
      const post = m.posts as unknown as { title: string; slug: string };
      return {
        post_id: m.post_id,
        post_title: post.title,
        post_slug: post.slug,
        sender: m.sender,
        time_label: m.time_label,
        snippet: (m.body ?? "").slice(0, 120),
      };
    });

  return NextResponse.json({ posts, messages });
}
