import { containsBlocked, sanitize } from "@/lib/content-filter";
import { createPublicClient } from "@/lib/supabase/public";
import { getServiceClient } from "@/lib/supabase/service";
import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VALID_EMOJI = [
  "✨","🌙","⭐","💫","🌸","💜","🖤","💀","🌻","🎵",
  "🦋","❤️","🌊","🔮","🌈","🕷️","🍄","🌿","🫧","🐚",
];

const WINDOW_MS = 24 * 60 * 60 * 1000;

function stampKey(ip: string) {
  return "stamp:" + createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

export async function GET() {
  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({ stamps: [] });
  const { data } = await supabase
    .from("visitor_stamps")
    .select("id,word,emoji,created_at")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(200);
  return NextResponse.json({ stamps: data ?? [] });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";

  // Validate first — bad input never touches the rate limit
  let body: { word?: string; emoji?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const rawWord = (body.word ?? "").trim();
  if (!rawWord) return NextResponse.json({ error: "word is required" }, { status: 400 });
  if (rawWord.length > 20) return NextResponse.json({ error: "max 20 characters" }, { status: 400 });
  if (rawWord.split(/\s+/).length > 2) return NextResponse.json({ error: "max 2 words" }, { status: 400 });
  if (containsBlocked(rawWord)) {
    return NextResponse.json({ error: "keep it kind :)" }, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  // Check rate limit (read-only — does NOT record the attempt yet)
  const key = stampKey(ip);
  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count } = await supabase
    .from("rate_limit_log")
    .select("id", { count: "exact", head: true })
    .eq("key", key)
    .gte("created_at", windowStart);

  if ((count ?? 0) >= 1) {
    return NextResponse.json({ error: "one stamp per day — come back tomorrow!" }, { status: 429 });
  }

  // Insert stamp
  const word = sanitize(rawWord);
  const emoji = body.emoji && VALID_EMOJI.includes(body.emoji) ? body.emoji : null;

  const { error } = await supabase.from("visitor_stamps").insert({ word, emoji });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Record rate limit only after the stamp actually lands
  await supabase.from("rate_limit_log").insert({ key });

  return NextResponse.json({ ok: true });
}
