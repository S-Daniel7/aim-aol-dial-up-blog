import { createPublicClient } from "@/lib/supabase/public";
import type { AskQuestion } from "@/lib/types";

const FIELDS = "id,created_at,question,answer,answered_at,is_visible,is_featured";

export async function fetchAnsweredQuestions(): Promise<AskQuestion[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("ask_questions")
    .select(FIELDS)
    .not("answer", "is", null)
    .eq("is_visible", true)
    .order("answered_at", { ascending: false });
  if (error || !data) return [];
  return (data as AskQuestion[]).map((q) => ({ ...q, is_featured: q.is_featured ?? false }));
}
