import { EDITOR_ROLES, getWorkspaceAccess } from "@/lib/admin-session";
import { getServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const access = await getWorkspaceAccess(req, EDITOR_ROLES);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  let body: { is_hidden?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ error: "Service not configured" }, { status: 500 });
  const { error } = await supabase
    .from("visitor_stamps")
    .update({ is_hidden: !!body.is_hidden })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
