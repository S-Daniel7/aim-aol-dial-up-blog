import { EDITOR_ROLES, getWorkspaceAccess } from "@/lib/admin-session";
import { getServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const access = await getWorkspaceAccess(req, EDITOR_ROLES);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let body: { answer?: string; is_visible?: boolean; is_featured?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ error: "Service not configured" }, { status: 500 });

  // Toggle visibility
  if ("is_visible" in body) {
    const { error } = await supabase
      .from("ask_questions")
      .update({ is_visible: !!body.is_visible })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Toggle featured
  if ("is_featured" in body) {
    const supabase2 = getServiceClient();
    if (!supabase2) return NextResponse.json({ error: "Service not configured" }, { status: 500 });
    if (body.is_featured) {
      // Unfeature all others first so only one is featured at a time
      await supabase2.from("ask_questions").update({ is_featured: false }).eq("is_featured", true);
    }
    const { error } = await supabase2
      .from("ask_questions")
      .update({ is_featured: !!body.is_featured })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Publish answer
  const answer = (body.answer ?? "").trim();
  if (!answer) return NextResponse.json({ error: "Answer cannot be empty" }, { status: 400 });

  const { error } = await supabase
    .from("ask_questions")
    .update({ answer, answered_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const access = await getWorkspaceAccess(req, EDITOR_ROLES);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ error: "Service not configured" }, { status: 500 });

  const { error } = await supabase.from("ask_questions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
