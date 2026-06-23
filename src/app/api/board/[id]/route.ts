import { EDITOR_ROLES, getWorkspaceAccess } from "@/lib/admin-session";
import { boardPayloadToRow, type BoardPayload } from "@/lib/board-payload";
import { getServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const access = await getWorkspaceAccess(req, EDITOR_ROLES);
  if (!access) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service not configured" },
      { status: 500 },
    );
  }

  let payload: BoardPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const result = boardPayloadToRow(payload);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const { id } = await ctx.params;
  const { data, error } = await supabase
    .from("board_items")
    .update(result.row)
    .eq("id", id)
    .eq("workspace_id", access.workspaceId)
    .select(
      "id,kind,image_url,text,x,y,width,height,rotation,z_index,font_family,font_size,color,is_bold,is_italic,is_underline,created_at,updated_at",
    )
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ item: data });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const access = await getWorkspaceAccess(req, EDITOR_ROLES);
  if (!access) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service not configured" },
      { status: 500 },
    );
  }
  const { id } = await ctx.params;
  const { error } = await supabase
    .from("board_items")
    .delete()
    .eq("id", id)
    .eq("workspace_id", access.workspaceId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
