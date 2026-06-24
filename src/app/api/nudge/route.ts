import { EDITOR_ROLES, getWorkspaceAccess } from "@/lib/admin-session";
import { isRateLimited } from "@/lib/rate-limit";
import { createPublicClient } from "@/lib/supabase/public";
import { getServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const access = await getWorkspaceAccess(req, EDITOR_ROLES);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({ count: 0, last_nudged_at: null });
  const { data } = await supabase.from("site_nudges").select("count,last_nudged_at").maybeSingle();
  return NextResponse.json({ count: data?.count ?? 0, last_nudged_at: data?.last_nudged_at ?? null });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  if (await isRateLimited("nudge", ip, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Easy there — max 3 nudges per hour!" }, { status: 429 });
  }
  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  const { data, error } = await supabase.rpc("increment_nudge_count");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ count: data });
}
