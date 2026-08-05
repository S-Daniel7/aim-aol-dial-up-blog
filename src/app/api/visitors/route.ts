import { isRateLimited } from "@/lib/rate-limit";
import { createPublicClient } from "@/lib/supabase/public";
import { getServiceClient } from "@/lib/supabase/service";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({ counts: [] });
  const { data } = await supabase
    .from("visitor_geo")
    .select("country_code,count")
    .order("count", { ascending: false })
    .limit(60);
  return NextResponse.json({ counts: data ?? [] });
}

export async function POST(req: NextRequest) {
  // Country comes from the edge/CDN. Vercel sets x-vercel-ip-country;
  // fall back to a generic Cloudflare header. Absent in local dev.
  const cc = (
    req.headers.get("x-vercel-ip-country") ??
    req.headers.get("cf-ipcountry") ??
    ""
  ).trim();

  if (!/^[A-Za-z]{2}$/.test(cc)) {
    return NextResponse.json({ ok: false });
  }

  // Count each visitor at most once per 12h so tallies mean "people", not loads.
  const ip =
    (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (await isRateLimited("visit", ip, 1, 12 * 60 * 60 * 1000)) {
    return NextResponse.json({ ok: true, counted: false });
  }

  const supabase = getServiceClient();
  if (!supabase) return NextResponse.json({ ok: false });

  await supabase.rpc("increment_visitor", { cc });
  return NextResponse.json({ ok: true, counted: true });
}
