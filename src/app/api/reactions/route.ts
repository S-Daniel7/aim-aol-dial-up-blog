import { isRateLimited } from "@/lib/rate-limit";
import { createPublicClient } from "@/lib/supabase/public";
import { getServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VALID_EMOJIS = [":-)", ":-O", "<3", ":'(", ":-P"];

export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get("post_id");
  if (!postId) return NextResponse.json({ counts: {} });

  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({ counts: {} });

  const { data } = await supabase
    .from("post_reactions")
    .select("emoji")
    .eq("post_id", postId);

  const counts: Record<string, number> = {};
  for (const emoji of VALID_EMOJIS) counts[emoji] = 0;
  for (const row of data ?? []) {
    if (row.emoji in counts) counts[row.emoji]++;
  }

  return NextResponse.json({ counts });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";

  let body: { post_id?: string; emoji?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { post_id, emoji } = body;
  if (!post_id || !emoji || !VALID_EMOJIS.includes(emoji)) {
    return NextResponse.json({ error: "Invalid emoji or post" }, { status: 400 });
  }

  if (await isRateLimited(`reaction:${post_id}:${emoji}`, ip, 1, 24 * 60 * 60 * 1000)) {
    return NextResponse.json({ error: "already reacted!" }, { status: 429 });
  }

  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const { error } = await supabase.from("post_reactions").insert({ post_id, emoji });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
