import { EDITOR_ROLES, getWorkspaceAccess } from "@/lib/admin-session";
import { getServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await getWorkspaceAccess(req, EDITOR_ROLES);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let body: { title?: string; url?: string; description?: string; category?: string; order_index?: number };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const { error } = await supabase.from("site_links").update({
    title: (body.title ?? "").trim(),
    url: (body.url ?? "").trim(),
    description: (body.description ?? "").trim() || null,
    category: (body.category ?? "links").trim() || "links",
    order_index: body.order_index ?? 0,
  }).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await getWorkspaceAccess(req, EDITOR_ROLES);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const { error } = await supabase.from("site_links").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
