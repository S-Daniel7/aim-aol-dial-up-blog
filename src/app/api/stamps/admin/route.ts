import { EDITOR_ROLES, getWorkspaceAccess } from "@/lib/admin-session";
import { getServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const access = await getWorkspaceAccess(req, EDITOR_ROLES);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ stamps: [] });
  const { data } = await supabase
    .from("visitor_stamps")
    .select("id,word,emoji,created_at,is_hidden")
    .order("created_at", { ascending: false })
    .limit(500);
  return NextResponse.json({ stamps: data ?? [] });
}
