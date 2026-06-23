import { sanitize } from "@/lib/content-filter";
import { isRateLimited } from "@/lib/rate-limit";
import { createPublicClient } from "@/lib/supabase/public";
import { getServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({ entries: [] });
  const { data, error } = await supabase
    .from("guestbook_entries")
    .select("id,author_name,body,created_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Failed to load entries" }, { status: 500 });
  return NextResponse.json({ entries: data ?? [] });
}

export async function POST(req: NextRequest) {
  const ip =
    (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";

  if (await isRateLimited("guestbook", ip, 10, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 },
    );
  }

  let body: { author_name?: string; body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Sanitize: strip HTML, censor profanity and hate speech
  const author_name = sanitize((body.author_name ?? "").trim());
  const text = sanitize((body.body ?? "").trim());

  if (!author_name || author_name.length > 60) {
    return NextResponse.json(
      { error: "Name must be 1–60 characters" },
      { status: 400 },
    );
  }
  if (!text || text.length > 500) {
    return NextResponse.json(
      { error: "Message must be 1–500 characters" },
      { status: 400 },
    );
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service not configured" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("guestbook_entries")
    .insert({ author_name, body: text })
    .select("id,author_name,body,created_at")
    .single();

  if (error) return NextResponse.json({ error: "Failed to submit entry" }, { status: 500 });
  return NextResponse.json({ entry: data }, { status: 201 });
}
