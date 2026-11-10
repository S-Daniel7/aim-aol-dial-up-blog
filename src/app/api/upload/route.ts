import { EDITOR_ROLES, getWorkspaceAccess } from "@/lib/admin-session";
import { getServiceClient } from "@/lib/supabase/service";
import { detectImageType, MAX_UPLOAD_BYTES } from "@/lib/image-upload";
import { NextRequest, NextResponse } from "next/server";

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
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 413 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const detected = detectImageType(buf);
  if (!detected) {
    return NextResponse.json(
      { error: "Unsupported file type — use JPEG, PNG, GIF, or WebP" },
      { status: 415 },
    );
  }
  // Extension comes from the detected type, never the user-supplied name.
  const base = file.name
    .replace(/\.[^.]*$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 60) || "image";
  const path = `uploads/${access.workspaceId}/${access.user.id}/${Date.now()}-${base}.${detected.ext}`;
  const { error: upErr } = await supabase.storage
    .from("blog-images")
    .upload(path, buf, { contentType: detected.mime });
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }
  const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
