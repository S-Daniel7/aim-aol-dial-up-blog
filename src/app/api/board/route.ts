import { EDITOR_ROLES, getWorkspaceAccess } from "@/lib/admin-session";
import {
  boardPayloadToRow,
  type BoardPayload,
} from "@/lib/board-payload";
import { createPublicClient } from "@/lib/supabase/public";
import { getServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createPublicClient();
  if (!supabase) {
    return NextResponse.json({ items: [] });
  }
  const { data, error } = await supabase
    .from("board_items")
    .select(
      "id,kind,image_url,text,x,y,width,height,rotation,z_index,font_family,font_size,color,is_bold,is_italic,is_underline,created_at,updated_at",
    )
    .order("z_index", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
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

  const { data, error } = await supabase
    .from("board_items")
    .insert({
      ...result.row,
      author_id: access.user.id,
      workspace_id: access.workspaceId,
      visibility: "public",
    })
    .select(
      "id,kind,image_url,text,x,y,width,height,rotation,z_index,font_family,font_size,color,is_bold,is_italic,is_underline,created_at,updated_at",
    )
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ item: data });
}
