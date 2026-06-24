import { EDITOR_ROLES, getWorkspaceAccess } from "@/lib/admin-session";
import { createPublicClient } from "@/lib/supabase/public";
import { getServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({ away_message: null });
  const { data } = await supabase
    .from("away_message")
    .select("body,updated_at")
    .maybeSingle();
  return NextResponse.json({ away_message: data ?? null });
}

export async function PUT(req: NextRequest) {
  const access = await getWorkspaceAccess(req, EDITOR_ROLES);
  if (!access) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const text = (body.body ?? "").trim();
  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service not configured" }, { status: 500 });
  }

  // Archive the current away message before overwriting
  const { data: current } = await supabase
    .from("away_message")
    .select("body")
    .maybeSingle();
  if (current?.body && current.body.trim() !== text) {
    await supabase
      .from("away_message_history")
      .insert({ body: current.body.trim(), saved_at: new Date().toISOString() });
  }

  const { error } = await supabase
    .from("away_message")
    .upsert({ id: 1, body: text, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
