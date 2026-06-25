import { createPublicClient } from "@/lib/supabase/public";
import type { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Away message archive",
  description: "a history of away messages",
};

type HistoryEntry = { id: string; body: string; saved_at: string };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AwayPage() {
  const supabase = createPublicClient();

  const [currentRes, historyRes] = await Promise.all([
    supabase?.from("away_message").select("body,updated_at").maybeSingle(),
    supabase
      ?.from("away_message_history")
      .select("id,body,saved_at")
      .order("saved_at", { ascending: false })
      .limit(50),
  ]);

  const current = currentRes?.data ?? null;
  const history: HistoryEntry[] = (historyRes?.data ?? []) as HistoryEntry[];

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="mb-1 font-heading text-3xl tracking-wide text-accent"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          ~* away message archive *~
        </h1>
        <p className="font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
          a record of things i was thinking about
        </p>
      </div>

      {/* Current */}
      {current?.body && (
        <div
          className="border-2 border-border bg-surface"
          style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
        >
          <div
            className="flex items-center gap-2 border-b-2 border-border bg-title-bar px-3 py-2"
          >
            <span className="online-dot" />
            <span className="font-heading text-lg text-title-bar-text" style={{ fontFamily: "var(--font-heading)" }}>
              current away message
            </span>
          </div>
          <div className="p-4">
            <p
              className="font-mono text-sm text-text leading-relaxed whitespace-pre-wrap"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >
              {current.body}<span className="blink">_</span>
            </p>
            <p
              className="mt-3 font-mono text-[10px] text-muted"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >
              set {formatDate(current.updated_at)} at {formatTime(current.updated_at)}
            </p>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 ? (
        <div>
          <p
            className="mb-4 border-b-2 border-border pb-2 font-heading text-xl text-text"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            past messages
          </p>
          <div className="relative pl-6">
            {/* Timeline line */}
            <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-5">
              {history.map((entry, i) => (
                <div
                  key={entry.id}
                  className="animate-slide-in relative"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  {/* Dot on timeline */}
                  <div className="absolute -left-4 top-1.5 h-2 w-2 border-2 border-border bg-surface-2" />

                  <p
                    className="mb-1 font-mono text-[10px] text-muted"
                    style={{ fontFamily: "var(--font-mono-chat)" }}
                  >
                    {formatDate(entry.saved_at)} · {formatTime(entry.saved_at)}
                  </p>
                  <p
                    className="font-mono text-sm text-text leading-relaxed whitespace-pre-wrap"
                    style={{ fontFamily: "var(--font-mono-chat)" }}
                  >
                    {entry.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="font-mono text-sm text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
          no history yet
        </p>
      )}
    </div>
  );
}
