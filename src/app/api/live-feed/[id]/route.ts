import { verifyAdminRequest } from "@/lib/admin-session";
import { getServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

const MAX_LEN = 4000;

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!verifyAdminRequest(req)) {
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
  let payload: { body?: string; imageUrl?: string | null };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const text = (payload.body ?? "")
    .trim()
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ");
  const imageUrl = (payload.imageUrl ?? "").trim() || null;
  if (!text && !imageUrl) {
    return NextResponse.json(
      { error: "Add caption text and/or an image." },
      { status: 400 },
    );
  }
  if (text.length > MAX_LEN) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }
  let result;
  try {
    result = await supabase
      .from("live_feed_entries")
      .update({ body: text, image_url: imageUrl })
      .eq("id", id)
      .select("id,feed_number,body,image_url,created_at")
      .single();
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
  const { data, error } = result;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ entry: data });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!verifyAdminRequest(req)) {
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
      .eq("id", id);
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
