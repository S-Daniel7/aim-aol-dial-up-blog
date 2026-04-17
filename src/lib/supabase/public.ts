import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/env";

export function createPublicClient() {
  const cfg = getSupabasePublicConfig();
  if (!cfg) return null;
  return createClient(cfg.url, cfg.anonKey);
}
