import { createPublicClient } from "@/lib/supabase/public";
import type { BoardItem } from "@/lib/types";

export async function fetchBoardItems(): Promise<BoardItem[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("board_items")
    .select(
      "id,kind,image_url,text,x,y,width,height,rotation,z_index,font_family,font_size,color,is_bold,is_italic,is_underline,created_at,updated_at",
    )
    .order("z_index", { ascending: true })
    .order("created_at", { ascending: true });
  return (data as BoardItem[]) ?? [];
}
