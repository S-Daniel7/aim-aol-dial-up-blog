import { createHash } from "crypto";
import { getServiceClient } from "@/lib/supabase/service";

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

/**
 * Supabase-backed rate limiter — survives serverless cold starts.
 * prefix: namespaces the key, e.g. "login" or "guestbook"
 * Returns true if the caller should be blocked.
 */
export async function isRateLimited(
  prefix: string,
  ip: string,
  maxCount: number,
  windowMs: number,
): Promise<boolean> {
  const supabase = getServiceClient();
  if (!supabase) return false;

  const key = `${prefix}:${hashIp(ip)}`;
  const windowStart = new Date(Date.now() - windowMs).toISOString();

  const { count } = await supabase
    .from("rate_limit_log")
    .select("id", { count: "exact", head: true })
    .eq("key", key)
    .gte("created_at", windowStart);

  if ((count ?? 0) >= maxCount) return true;

  await supabase.from("rate_limit_log").insert({ key });
  return false;
}
