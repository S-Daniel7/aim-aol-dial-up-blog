import { getServiceClient } from "@/lib/supabase/service";
import { createPublicClient } from "@/lib/supabase/public";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({ count: null });
  const { data } = await supabase.from("site_hits").select("count").maybeSingle();
  return NextResponse.json({ count: (data as { count: number } | null)?.count ?? 0 });
}

export async function POST() {
  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ count: null });
  const { data, error } = await supabase.rpc("increment_hit_count");
  if (error) return NextResponse.json({ count: null });
  return NextResponse.json({ count: data as number });
}
