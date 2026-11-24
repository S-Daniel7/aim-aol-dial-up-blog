import { EDITOR_ROLES, getWorkspaceAccess } from "@/lib/admin-session";
import { parseChatLines } from "@/lib/parseChat";
import { parsePublishAt, parseTags } from "@/lib/post-meta";
import { POST_COLUMNS } from "@/lib/posts";
import { slugify } from "@/lib/slug";
import { getServiceClient } from "@/lib/supabase/service";
import { createPublicClient } from "@/lib/supabase/public";
import { NextRequest, NextResponse } from "next/server";

export type ImagePayload = {
  url: string;
  sender: string;
  time_label: string;
  caption?: string;
};

export async function GET(req: NextRequest) {
  // Signed-in editors also see scheduled (future) posts for their workspace;
  // everyone else goes through the anon client, where RLS hides them.
  const access = await getWorkspaceAccess(req, EDITOR_ROLES);
  const supabase = access
    ? (getServiceClient() ?? createPublicClient())
    : createPublicClient();
  if (!supabase) {
    return NextResponse.json({ posts: [] });
  }
  const includeMessages =
    req.nextUrl.searchParams.get("includeMessages") === "1";
  let query = supabase
    .from("posts")
    .select(POST_COLUMNS)
    .order("is_pinned", { ascending: false })
    .order("publish_at", { ascending: false });
  if (access) query = query.eq("workspace_id", access.workspaceId);
  const { data: posts, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!includeMessages || !posts?.length) {
    return NextResponse.json({ posts: posts ?? [] });
  }
  const postIds = posts.map((post) => post.id as string);
  const { data: messages, error: messagesError } = await supabase
    .from("messages")
    .select(
      "id,post_id,order_index,kind,sender,time_label,body,image_url,image_caption",
    )
    .in("post_id", postIds)
    .order("post_id", { ascending: true })
    .order("order_index", { ascending: true });
  if (messagesError) {
    return NextResponse.json(
      { error: messagesError.message },
      { status: 500 },
    );
  }
  return NextResponse.json({ posts: posts ?? [], messages: messages ?? [] });
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
  let body: {
    title?: string;
    slug?: string;
    blurb?: string | null;
    myHandle?: string | null;
    publishAt?: string | null;
    isPinned?: boolean;
    tags?: string[] | string;
    chatText?: string;
    images?: ImagePayload[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const title = (body.title ?? "").trim();
  if (!title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }
  const slug = slugify((body.slug ?? "").trim() || title);
  const blurb = body.blurb?.trim() || null;
  const myHandle = body.myHandle?.trim() || null;
  const publishAt = parsePublishAt(body.publishAt);
  if ("error" in publishAt) {
    return NextResponse.json({ error: publishAt.error }, { status: 400 });
  }
  const tags = parseTags(body.tags);
  const chatText = body.chatText ?? "";
  let textMessages: ReturnType<typeof parseChatLines> = [];
  try {
    textMessages = parseChatLines(chatText);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid chat text";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const images = Array.isArray(body.images) ? body.images : [];

  const { data: post, error: postErr } = await supabase
    .from("posts")
    .insert({
      title,
      slug,
      blurb,
      my_handle: myHandle,
      tags,
      is_pinned: body.isPinned === true,
      // Omit when empty so the column default (now()) applies.
      ...(publishAt.value ? { publish_at: publishAt.value } : {}),
      author_id: access.user.id,
      workspace_id: access.workspaceId,
      visibility: "public",
    })
    .select("id")
    .single();
  if (postErr) {
    const status = postErr.code === "23505" ? 409 : 500;
    return NextResponse.json({ error: postErr.message }, { status });
  }
  const postId = post.id as string;

  const rows: {
    post_id: string;
    workspace_id: string;
    author_id: string;
    order_index: number;
    kind: "text" | "image";
    sender: string;
    time_label: string;
    body: string | null;
    image_url: string | null;
    image_caption: string | null;
  }[] = [];

  textMessages.forEach((m, i) => {
    rows.push({
      post_id: postId,
      workspace_id: access.workspaceId,
      author_id: access.user.id,
      order_index: i,
      kind: "text",
      sender: m.sender,
      time_label: m.time_label,
      body: m.body,
      image_url: null,
      image_caption: null,
    });
  });
  const start = textMessages.length;
  images.forEach((im, j) => {
    if (!im.url?.trim()) return;
    rows.push({
      post_id: postId,
      workspace_id: access.workspaceId,
      author_id: access.user.id,
      order_index: start + j,
      kind: "image",
      sender: im.sender.trim() || "me",
      time_label: im.time_label.trim() || "—",
      body: null,
      image_url: im.url.trim(),
      image_caption: im.caption?.trim() || null,
    });
  });

  if (rows.length === 0) {
    await supabase.from("posts").delete().eq("id", postId);
    return NextResponse.json(
      { error: "Add chat lines and/or at least one image" },
      { status: 400 },
    );
  }

  const { error: msgErr } = await supabase.from("messages").insert(rows);
  if (msgErr) {
    await supabase.from("posts").delete().eq("id", postId);
    return NextResponse.json({ error: msgErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, slug });
}
