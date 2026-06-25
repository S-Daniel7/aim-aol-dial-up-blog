import { createPublicClient } from "@/lib/supabase/public";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({ history: [] });
  const { data } = await supabase
    .from("away_message_history")
    .select("id,body,saved_at")
    .order("saved_at", { ascending: false })
    .limit(50);
  return NextResponse.json({ history: data ?? [] });
}
