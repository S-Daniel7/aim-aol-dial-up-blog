import { createPublicClient } from "@/lib/supabase/public";
import type { AwayMessage, NowPlaying } from "@/lib/types";

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

export async function fetchNowPlaying(): Promise<NowPlaying | null> {
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("now_playing")
    .select("track_title,artist_name,updated_at")
    .maybeSingle();
  if (!data || !(data as NowPlaying).track_title) return null;
  return data as NowPlaying;
}
