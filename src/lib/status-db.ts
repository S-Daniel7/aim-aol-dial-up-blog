import { createPublicClient } from "@/lib/supabase/public";
import type { AwayMessage } from "@/lib/types";

export async function fetchAwayMessage(): Promise<AwayMessage | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("away_message")
    .select("body,updated_at")
    .maybeSingle();
  if (!data || !(data as AwayMessage).body) return null;
  return data as AwayMessage;
}
