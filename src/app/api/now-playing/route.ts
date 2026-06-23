import { EDITOR_ROLES, getWorkspaceAccess } from "@/lib/admin-session";
import { createPublicClient } from "@/lib/supabase/public";
import { getServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({ now_playing: null });
  const { data } = await supabase
    .from("now_playing")
    .select("track_title,artist_name,updated_at")
    .maybeSingle();
  return NextResponse.json({ now_playing: data ?? null });
}

export async function PUT(req: NextRequest) {
  const access = await getWorkspaceAccess(req, EDITOR_ROLES);
  if (!access) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { track_title?: string; artist_name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const track_title = (body.track_title ?? "").trim();
  const artist_name = (body.artist_name ?? "").trim();
  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service not configured" }, { status: 500 });
  }
  const { error } = await supabase
    .from("now_playing")
    .upsert({
      id: 1,
      track_title,
      artist_name,
      updated_at: new Date().toISOString(),
    });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
