import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

// Newest public content timestamps, used for the "new" badges in the nav.
// Cached at the CDN so this is cheap no matter how many visitors load a page.
export async function GET() {
  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({});

  const newest = async (table: string) => {
    const { data } = await supabase
      .from(table)
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1);
    return (data?.[0] as { created_at?: string } | undefined)?.created_at ?? null;
  };

  const [home, live, guestbook] = await Promise.all([
    newest("posts"),
    newest("live_feed_entries"),
    newest("guestbook_entries"),
  ]);

  return NextResponse.json(
    { "/": home, "/live": live, "/guestbook": guestbook },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
