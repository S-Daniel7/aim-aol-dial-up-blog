import { containsBlocked, sanitize } from "@/lib/content-filter";
import { isRateLimited } from "@/lib/rate-limit";
import { getServiceClient } from "@/lib/supabase/service";
import { EDITOR_ROLES, getWorkspaceAccess } from "@/lib/admin-session";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const access = await getWorkspaceAccess(req, EDITOR_ROLES);
  if (!access) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ questions: [] });
  const { data, error } = await supabase
    .from("ask_questions")
    .select("id,created_at,question,answer,answered_at,is_visible,is_featured")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  return NextResponse.json({ questions: data ?? [] });
}

export async function POST(req: NextRequest) {
  const ip =
    (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";

  if (await isRateLimited("ask", ip, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 },
    );
  }

  let body: { question?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const raw = (body.question ?? "").trim();

  if (!raw || raw.length < 3) {
    return NextResponse.json({ error: "Question is too short" }, { status: 400 });
  }
  if (raw.length > 500) {
    return NextResponse.json({ error: "Question must be under 500 characters" }, { status: 400 });
  }

  if (containsBlocked(raw)) {
    return NextResponse.json(
      { error: "Your question contains content that isn't allowed." },
      { status: 400 },
    );
  }

  const question = sanitize(raw);

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service not configured" }, { status: 500 });
  }

  const { error } = await supabase
    .from("ask_questions")
    .insert({ question });

  if (error) return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
