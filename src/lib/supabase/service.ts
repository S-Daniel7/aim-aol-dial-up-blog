import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServiceConfig } from "@/lib/env";

let cached: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient | null {
  const cfg = getSupabaseServiceConfig();
  if (!cfg) return null;
  if (!cached) {
    cached = createClient(cfg.url, cfg.serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
