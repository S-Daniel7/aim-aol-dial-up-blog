import { createPublicClient } from "@/lib/supabase/public";
import type { GuestbookEntry } from "@/lib/types";

export async function fetchGuestbookEntries(): Promise<GuestbookEntry[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("guestbook_entries")
    .select("id,author_name,body,created_at")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as GuestbookEntry[];
}

/** Most recent guestbook signatures, for the homepage ticker. */
export async function fetchRecentGuestbook(
  limit = 8,
): Promise<GuestbookEntry[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("guestbook_entries")
    .select("id,author_name,body,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as GuestbookEntry[]) ?? [];
}
