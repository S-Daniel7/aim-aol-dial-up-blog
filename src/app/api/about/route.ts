import { EDITOR_ROLES, getWorkspaceAccess } from "@/lib/admin-session";
import { createPublicClient } from "@/lib/supabase/public";
import { getServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({ about: null });
  const { data } = await supabase.from("site_about").select("*").maybeSingle();
  return NextResponse.json({ about: data ?? null });
}

export async function PUT(req: NextRequest) {
  const access = await getWorkspaceAccess(req, EDITOR_ROLES);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ error: "Service not configured" }, { status: 500 });

  const { error } = await supabase.from("site_about").upsert({
    id: 1,
    avatar_emoji: (body.avatar_emoji as string | undefined ?? "🌙").trim() || "🌙",
    screen_name: (body.screen_name as string | undefined ?? "soapie").trim() || "soapie",
    member_since: (body.member_since as string | undefined ?? "").trim(),
    location: (body.location as string | undefined ?? "").trim(),
    age: (body.age as string | undefined ?? "").trim(),
    status: (body.status as string | undefined ?? "").trim(),
    bio: (body.bio as string | undefined ?? "").trim(),
    interests: body.interests ?? {},
    fun_facts: body.fun_facts ?? [],
    get_to_know_me: body.get_to_know_me ?? [],
    updated_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
