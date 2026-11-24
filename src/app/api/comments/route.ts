import { EDITOR_ROLES, getWorkspaceAccess } from "@/lib/admin-session";
import { validateComment } from "@/lib/comment-input";
import { isRateLimited } from "@/lib/rate-limit";
import { createPublicClient } from "@/lib/supabase/public";
import { getServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET ?postId=...  -> approved comments for a post (public).
 * GET ?pending=1   -> moderation queue (editors only).
 */
export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("pending") === "1") {
    const access = await getWorkspaceAccess(req, EDITOR_ROLES);
    if (!access) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const service = getServiceClient();
    if (!service) return NextResponse.json({ comments: [] });
    const { data, error } = await service
      .from("comments")
      .select("id,post_id,author_name,body,status,created_at,posts(title,slug)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return NextResponse.json({ error: "Failed to load" }, { status: 500 });
    return NextResponse.json({ comments: data ?? [] });
  }

  const postId = req.nextUrl.searchParams.get("postId") ?? "";
  if (!UUID.test(postId)) {
    return NextResponse.json({ error: "postId required" }, { status: 400 });
  }
  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({ comments: [] });
  // RLS limits this to approved comments on published posts.
  const { data, error } = await supabase
    .from("comments")
    .select("id,author_name,body,created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  return NextResponse.json({ comments: data ?? [] });
}

export async function POST(req: NextRequest) {
  const ip =
    (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (await isRateLimited("comment", ip, 5, 60 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many comments. Please try again later." },
      { status: 429 },
    );
  }

  let body: { post_id?: string; author_name?: string; body?: string; website?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field. Pretend success.
  if (body.website) return NextResponse.json({ ok: true }, { status: 201 });

  if (typeof body.post_id !== "string" || !UUID.test(body.post_id)) {
    return NextResponse.json({ error: "Invalid post" }, { status: 400 });
  }
  const parsed = validateComment(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service not configured" }, { status: 500 });
  }

  // Only accept comments on posts the public can actually see.
  const { data: post } = await supabase
    .from("posts")
    .select("id")
    .eq("id", body.post_id)
    .eq("visibility", "public")
    .lte("publish_at", new Date().toISOString())
    .maybeSingle();
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const { error } = await supabase.from("comments").insert({
    post_id: body.post_id,
    author_name: parsed.authorName,
    body: parsed.body,
  });
  if (error) return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  return NextResponse.json({ ok: true, pending: true }, { status: 201 });
}
