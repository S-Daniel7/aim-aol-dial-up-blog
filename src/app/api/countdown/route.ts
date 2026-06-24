import { EDITOR_ROLES, getWorkspaceAccess } from "@/lib/admin-session";
import { createPublicClient } from "@/lib/supabase/public";
import { getServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({ countdown: null });
  const { data } = await supabase
    .from("site_countdown")
    .select("label,target_date,mode,is_visible")
    .maybeSingle();
  return NextResponse.json({ countdown: data ?? null });
}

export async function PUT(req: NextRequest) {
  const access = await getWorkspaceAccess(req, EDITOR_ROLES);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { label?: string; target_date?: string; mode?: string; is_visible?: boolean };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const { error } = await supabase.from("site_countdown").upsert({
    id: 1,
    label: (body.label ?? "").trim(),
    target_date: body.target_date || null,
    mode: body.mode === "until" ? "until" : "since",
    is_visible: body.is_visible ?? false,
    updated_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
