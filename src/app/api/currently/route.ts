import { EDITOR_ROLES, getWorkspaceAccess } from "@/lib/admin-session";
import { getServiceClient } from "@/lib/supabase/service";
import { createPublicClient } from "@/lib/supabase/public";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({ currently: null });
  const { data } = await supabase
    .from("site_currently")
    .select("reading,watching,listening,thinking,updated_at")
    .maybeSingle();
  return NextResponse.json({ currently: data ?? null });
}

export async function PUT(req: NextRequest) {
  const access = await getWorkspaceAccess(req, EDITOR_ROLES);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { reading?: string; watching?: string; listening?: string; thinking?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ error: "Service not configured" }, { status: 500 });

  const { error } = await supabase.from("site_currently").upsert({
    id: 1,
    reading: (body.reading ?? "").trim() || null,
    watching: (body.watching ?? "").trim() || null,
    listening: (body.listening ?? "").trim() || null,
    thinking: (body.thinking ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
