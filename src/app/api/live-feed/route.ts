import { EDITOR_ROLES, getWorkspaceAccess } from "@/lib/admin-session";
import { getServiceClient } from "@/lib/supabase/service";
import { createPublicClient } from "@/lib/supabase/public";
import { NextRequest, NextResponse } from "next/server";

const MAX_LEN = 4000;
const FIELDS = "id,feed_number,body,image_url,created_at,tags,is_pinned";

export const dynamic = "force-dynamic";

function parseTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.toLowerCase().trim())
    .filter((t) => t.length > 0 && t.length <= 30)
    .slice(0, 8);
}

export async function GET() {
  const supabase = createPublicClient();
  if (!supabase) {
    return NextResponse.json(
      { entries: [], error: "Supabase is not configured (missing env keys)." },
      { status: 200 },
    );
  }
  let result;
  try {
    result = await supabase
      .from("live_feed_entries")
      .select(FIELDS)
      .order("feed_number", { ascending: false });
  } catch (err) {
    return NextResponse.json(
      { entries: [], error: err instanceof Error ? `Could not reach Supabase: ${err.message}` : "Could not reach Supabase." },
      { status: 500 },
    );
  }
  const { data, error } = result;
  if (error) {
    const hint =
      error.message.includes("relation") || error.message.includes("does not exist")
        ? " Run the live_feed SQL in supabase/schema.sql."
        : "";
    return NextResponse.json({ entries: [], error: `${error.message}${hint}` }, { status: 500 });
  }
  return NextResponse.json({ entries: data ?? [] });
}

export async function POST(req: NextRequest) {
  const access = await getWorkspaceAccess(req, EDITOR_ROLES);
  if (!access) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service role key missing (SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 500 },
    );
  }
  let payload: { body?: string; imageUrl?: string | null; tags?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const text = (payload.body ?? "").trim().replace(/\r?\n/g, " ").replace(/\s+/g, " ");
  const imageUrl = (payload.imageUrl ?? "").trim() || null;
  if (!text && !imageUrl) {
    return NextResponse.json({ error: "Add text and/or an image." }, { status: 400 });
  }
  if (text.length > MAX_LEN) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }
  const tags = parseTags(payload.tags);
  let result;
  try {
    result = await supabase
      .from("live_feed_entries")
      .insert({
        body: text,
        image_url: imageUrl,
        tags,
        author_id: access.user.id,
        workspace_id: access.workspaceId,
        visibility: "public",
      })
      .select(FIELDS)
      .single();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? `Could not reach Supabase: ${err.message}` : "Could not reach Supabase." },
      { status: 500 },
    );
  }
  const { data, error } = result;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ entry: data });
}
