import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

// Newest public content timestamps, used for the "new" badges in the nav.
// Cached at the CDN so this is cheap no matter how many visitors load a page.
export async function GET() {
  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({});

  const newest = async (table: string, column = "created_at") => {
    const { data } = await supabase
      .from(table)
      .select(column)
      .order(column, { ascending: false })
      .limit(1);
    return (
      (data?.[0] as unknown as Record<string, string> | undefined)?.[column] ??
      null
    );
  };

  const [home, live, guestbook] = await Promise.all([
    newest("posts", "publish_at"),
    newest("live_feed_entries"),
    newest("guestbook_entries"),
  ]);

  return NextResponse.json(
    { "/": home, "/live": live, "/guestbook": guestbook },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
