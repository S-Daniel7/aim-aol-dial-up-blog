import { EDITOR_ROLES, getWorkspaceAccess } from "@/lib/admin-session";
import { createPublicClient } from "@/lib/supabase/public";
import { getServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({ links: [] });
  const { data } = await supabase
    .from("site_links")
    .select("id,title,url,description,category,order_index")
    .order("category")
    .order("order_index")
    .order("created_at");
  return NextResponse.json({ links: data ?? [] });
}

export async function POST(req: NextRequest) {
  const access = await getWorkspaceAccess(req, EDITOR_ROLES);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { title?: string; url?: string; description?: string; category?: string; order_index?: number };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  const url = (body.url ?? "").trim();
  if (!title || !url) return NextResponse.json({ error: "title and url required" }, { status: 400 });

  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  const { data, error } = await supabase.from("site_links").insert({
    title,
    url,
    description: (body.description ?? "").trim() || null,
    category: (body.category ?? "links").trim() || "links",
    order_index: body.order_index ?? 0,
  }).select("id").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}
