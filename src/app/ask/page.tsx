import { AskForm } from "@/components/AskForm";
import { getSupabasePublicConfig } from "@/lib/env";
import { fetchAnsweredQuestions } from "@/lib/ask-db";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Ask",
  description: "Ask me anything!",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AskPage() {
  const configured = !!getSupabasePublicConfig();
  const questions = configured ? await fetchAnsweredQuestions() : [];
  const featured = questions.find((q) => q.is_featured) ?? null;
  const rest = questions.filter((q) => !q.is_featured);

  function QCard({ q, i, highlight }: { q: (typeof questions)[0]; i: number; highlight?: boolean }) {
    return (
      <div
        className={`card-lift animate-slide-in border-2 border-border ${highlight ? "bg-surface-2" : "bg-surface"}`}
        style={{
          boxShadow: "3px 3px 0 0 var(--border)",
          animationDelay: `${i * 0.06}s`,
        }}
      >
        <div className="border-b border-border bg-surface-2 px-3 py-2">
          {highlight && (
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1" style={{ fontFamily: "var(--font-mono-chat)" }}>
              ★ featured answer
            </p>
          )}
          <p
            className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            anonymous asked:
          </p>
          <p
            className="font-mono text-sm text-link leading-relaxed whitespace-pre-wrap"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            {q.question}
          </p>
        </div>
        <div className="px-3 py-3">
          <p
            className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            soapie answered:
          </p>
          <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">{q.answer}</p>
          <p
            className="mt-2 font-mono text-[10px] text-muted"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            {q.answered_at ? formatDate(q.answered_at) : ""}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="mb-1 font-heading text-3xl tracking-wide text-accent"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          ~* ask box *~
        </h1>
        <p
          className="font-mono text-xs text-muted"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          send me a question, i&apos;ll answer it here :)
        </p>
      </div>

      <AskForm />

      {featured && <QCard q={featured} i={0} highlight />}

      {rest.length > 0 && (
        <div className="space-y-4">
          <p
            className="border-b-2 border-border pb-2 font-heading text-xl text-text"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {questions.length} {questions.length === 1 ? "answer" : "answers"}
          </p>

          {rest.map((q, i) => (
            <QCard key={q.id} q={q} i={i + 1} />
          ))}
        </div>
      )}

      {configured && questions.length === 0 && (
        <p
          className="font-mono text-sm text-muted"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          no answers yet — be the first to ask!
        </p>
      )}
    </div>
  );
}
