import { EDITOR_ROLES, getWorkspaceAccess } from "@/lib/admin-session";
import { getServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

const MAX_LEN = 4000;
const FIELDS = "id,feed_number,body,image_url,created_at,tags,is_pinned";

type Ctx = { params: Promise<{ id: string }> };

function parseTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.toLowerCase().trim())
    .filter((t) => t.length > 0 && t.length <= 30)
    .slice(0, 8);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const access = await getWorkspaceAccess(req, EDITOR_ROLES);
  if (!access) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role key missing." }, { status: 500 });
  }
  const { id } = await ctx.params;
  let payload: { body?: string; imageUrl?: string | null; tags?: unknown; is_pinned?: boolean };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  const hasBodyOrImage = "body" in payload || "imageUrl" in payload;

  if (hasBodyOrImage) {
    const text = (payload.body ?? "").trim().replace(/\r?\n/g, " ").replace(/\s+/g, " ");
    const imageUrl = (payload.imageUrl ?? "").trim() || null;
    if (!text && !imageUrl) {
      return NextResponse.json({ error: "Add caption text and/or an image." }, { status: 400 });
    }
    if (text.length > MAX_LEN) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }
    updates.body = text;
    updates.image_url = imageUrl;
  }
  if ("tags" in payload) updates.tags = parseTags(payload.tags);
  if ("is_pinned" in payload) updates.is_pinned = !!payload.is_pinned;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  let result;
  try {
    result = await supabase
      .from("live_feed_entries")
      .update(updates)
      .eq("id", id)
      .eq("workspace_id", access.workspaceId)
      .select(FIELDS)
      .single();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? `Could not reach Supabase: ${err.message}` : "Could not reach Supabase." },
      { status: 500 },
    );
  }
  const { data, error } = result;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ entry: data });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const access = await getWorkspaceAccess(req, EDITOR_ROLES);
  if (!access) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service role key missing." },
      { status: 500 },
    );
  }
  const { id } = await ctx.params;
  let result;
  try {
    result = await supabase
      .from("live_feed_entries")
      .delete()
      .eq("id", id)
      .eq("workspace_id", access.workspaceId);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? `Could not reach Supabase: ${err.message}`
            : "Could not reach Supabase.",
      },
      { status: 500 },
    );
  }
  const { error } = result;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
