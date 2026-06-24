import { createPublicClient } from "@/lib/supabase/public";
import type { SiteCurrently, SiteMood } from "@/lib/types";

export type CountdownData = {
  label: string;
  target_date: string;
  mode: "since" | "until";
  is_visible: boolean;
};

export async function fetchCountdown(): Promise<CountdownData | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from("site_countdown")
      .select("label,target_date,mode,is_visible")
      .maybeSingle();
    const d = data as CountdownData | null;
    if (!d || !d.is_visible || !d.label || !d.target_date) return null;
    return d;
  } catch {
    return null;
  }
}

export async function fetchCurrently(): Promise<SiteCurrently | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("site_currently")
    .select("reading,watching,listening,thinking,updated_at")
    .maybeSingle();
  if (!data) return null;
  const d = data as SiteCurrently;
  if (!d.reading && !d.watching && !d.listening && !d.thinking) return null;
  return d;
}

export async function fetchMood(): Promise<SiteMood | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("site_mood")
    .select("mood,updated_at")
    .maybeSingle();
  if (!data || !(data as SiteMood).mood) return null;
  return data as SiteMood;
}
