import { createPublicClient } from "@/lib/supabase/public";
import type { Metadata } from "next";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Site stats",
  description: "by the numbers",
};

async function getStat(
  supabase: ReturnType<typeof createPublicClient>,
  table: string,
  column?: string,
): Promise<number> {
  if (!supabase) return 0;
  try {
    if (column) {
      const { data } = await supabase.from(table).select(column).maybeSingle();
      return (data as Record<string, number> | null)?.[column] ?? 0;
    }
    const { count } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true });
    return count ?? 0;
  } catch {
    return 0;
  }
}

function pad(n: number, len = 6) {
  return n.toString().padStart(len, "0");
}

export default async function StatsPage() {
  const supabase = createPublicClient();

  const [
    hits,
    guestbookEntries,
    stamps,
    nudges,
    reactions,
    posts,
    liveEntries,
    answeredQuestions,
  ] = await Promise.all([
    getStat(supabase, "site_hits", "count"),
    getStat(supabase, "guestbook"),
    getStat(supabase, "visitor_stamps"),
    getStat(supabase, "site_nudges", "count"),
    getStat(supabase, "post_reactions"),
    getStat(supabase, "posts"),
    getStat(supabase, "live_feed_entries"),
    (async () => {
      if (!supabase) return 0;
      const { count } = await supabase
        .from("ask_questions")
        .select("id", { count: "exact", head: true })
        .not("answer", "is", null);
      return count ?? 0;
    })(),
  ]);

  const rows: { label: string; value: string; note?: string }[] = [
    { label: "total visitors", value: `#${pad(hits)}` },
    { label: "guestbook entries", value: pad(guestbookEntries, 4) },
    { label: "stamps left", value: pad(stamps, 4) },
    { label: "nudges received", value: pad(nudges, 4) },
    { label: "post reactions", value: pad(reactions, 4) },
    { label: "questions answered", value: pad(answeredQuestions, 4) },
    { label: "chat logs", value: pad(posts, 4) },
    { label: "live feed entries", value: pad(liveEntries, 4) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="mb-1 font-heading text-3xl tracking-wide text-accent"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          ~* by the numbers *~
        </h1>
        <p className="font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
          a little snapshot of this site, live
        </p>
      </div>

      <div
        className="border-2 border-border bg-surface"
        style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
      >
        <div
          className="border-b-2 border-border bg-title-bar px-3 py-2 font-heading text-lg text-title-bar-text"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          site_stats.exe
        </div>
        <div className="divide-y divide-border">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className="animate-slide-in flex items-baseline justify-between px-4 py-3"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span
                className="font-mono text-sm text-muted"
                style={{ fontFamily: "var(--font-mono-chat)" }}
              >
                {row.label}
              </span>
              <span
                className="font-mono text-xl tabular-nums text-accent"
                style={{ fontFamily: "var(--font-mono-chat)" }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
        <div
          className="border-t border-border px-4 py-2 font-mono text-[10px] text-muted"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          ✦ updated in real time · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
      </div>
    </div>
  );
}
