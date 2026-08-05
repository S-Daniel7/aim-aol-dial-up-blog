import { createPublicClient } from "@/lib/supabase/public";

export type VisitorCount = { country_code: string; count: number };

/** Aggregated per-country visitor tallies, highest first. */
export async function fetchVisitorCounts(): Promise<VisitorCount[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("visitor_geo")
    .select("country_code,count")
    .order("count", { ascending: false })
    .limit(60);
  return (data as VisitorCount[]) ?? [];
}
