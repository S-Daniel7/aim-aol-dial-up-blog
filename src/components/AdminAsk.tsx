"use client";

import type { AskQuestion } from "@/lib/types";
import { useEffect, useState } from "react";

export function AdminAsk() {
  const [questions, setQuestions] = useState<AskQuestion[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  async function load() {
    const res = await fetch("/api/ask", { credentials: "include" });
    const data = (await res.json().catch(() => ({}))) as { questions?: AskQuestion[] };
    setQuestions(data.questions ?? []);
  }

  useEffect(() => { void load(); }, []);

  async function submitAnswer(id: string) {
    const answer = (answers[id] ?? "").trim();
    if (!answer) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/ask/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ answer }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus(d.error ?? "Failed to save answer");
        return;
      }
      setAnswers((prev) => ({ ...prev, [id]: "" }));
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this question?")) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/ask/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus(d.error ?? "Delete failed");
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function toggleVisible(id: string, current: boolean) {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/ask/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_visible: !current }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus(d.error ?? "Failed");
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function toggleFeatured(id: string, current: boolean) {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/ask/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_featured: !current }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus(d.error ?? "Failed");
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  const unanswered = questions.filter((q) => !q.answer);
  const answered = questions.filter((q) => q.answer);

  return (
    <div className="space-y-8">
      {status ? (
        <p className="font-mono text-xs text-accent" style={{ fontFamily: "var(--font-mono-chat)" }}>
          !! {status}
        </p>
      ) : null}

      {/* Unanswered */}
      <section>
        <h2
          className="mb-4 border-b-2 border-border pb-2 font-heading text-xl text-text"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          unanswered ({unanswered.length})
        </h2>
        {unanswered.length === 0 ? (
          <p className="font-mono text-sm text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
            all caught up!
          </p>
        ) : (
          <div className="space-y-4">
            {unanswered.map((q) => (
              <div
                key={q.id}
                className="border-2 border-border bg-surface p-3"
                style={{ boxShadow: "2px 2px 0 0 var(--border)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <p
                      className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1"
                      style={{ fontFamily: "var(--font-mono-chat)" }}
                    >
                      {new Date(q.created_at).toLocaleString()}
                    </p>
                    <p className="text-sm text-text whitespace-pre-wrap">{q.question}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => void remove(q.id)}
                      disabled={busy}
                      className="border border-border bg-surface-2 px-2 py-1 text-xs text-accent hover:bg-page-bg disabled:opacity-50"
                    >
                      delete
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    placeholder="write your answer..."
                    value={answers[q.id] ?? ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }
                    className="w-full border-2 border-border bg-page-bg px-3 py-2 font-mono text-sm text-text focus:outline-none focus:border-accent"
                    style={{ fontFamily: "var(--font-mono-chat)", resize: "vertical" }}
                  />
                  <button
                    type="button"
                    onClick={() => void submitAnswer(q.id)}
                    disabled={busy || !(answers[q.id] ?? "").trim()}
                    className="border-2 border-border bg-accent px-4 py-1 font-heading text-base text-accent-contrast enabled:hover:bg-accent-hover disabled:opacity-50"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    publish answer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Answered */}
      {answered.length > 0 && (
        <section>
          <h2
            className="mb-4 border-b-2 border-border pb-2 font-heading text-xl text-text"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            answered ({answered.length})
          </h2>
          <div className="space-y-3">
            {answered.map((q) => (
              <div
                key={q.id}
                className="border-2 border-border bg-surface p-3"
                style={{ boxShadow: "2px 2px 0 0 var(--border)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    {q.is_featured && (
                      <p className="font-mono text-[10px] text-accent" style={{ fontFamily: "var(--font-mono-chat)" }}>
                        ★ featured
                      </p>
                    )}
                    {!q.is_visible && (
                      <p className="font-mono text-[10px] text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
                        [hidden]
                      </p>
                    )}
                    <div>
                      <p
                        className="font-mono text-[10px] uppercase tracking-widest text-muted mb-0.5"
                        style={{ fontFamily: "var(--font-mono-chat)" }}
                      >
                        question
                      </p>
                      <p className="text-sm text-link whitespace-pre-wrap">{q.question}</p>
                    </div>
                    <div>
                      <p
                        className="font-mono text-[10px] uppercase tracking-widest text-accent mb-0.5"
                        style={{ fontFamily: "var(--font-mono-chat)" }}
                      >
                        answer
                      </p>
                      <p className="text-sm text-text whitespace-pre-wrap">{q.answer}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => void toggleFeatured(q.id, q.is_featured)}
                      disabled={busy}
                      className={`border px-2 py-1 text-xs disabled:opacity-50 ${q.is_featured ? "border-accent bg-accent text-accent-contrast hover:bg-accent-hover" : "border-border bg-surface-2 text-muted hover:bg-page-bg"}`}
                    >
                      {q.is_featured ? "★ unfeature" : "feature"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleVisible(q.id, q.is_visible)}
                      disabled={busy}
                      className="border border-border bg-surface-2 px-2 py-1 text-xs text-muted hover:bg-page-bg disabled:opacity-50"
                    >
                      {q.is_visible ? "hide" : "show"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(q.id)}
                      disabled={busy}
                      className="border border-border bg-surface-2 px-2 py-1 text-xs text-accent hover:bg-page-bg disabled:opacity-50"
                    >
                      delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
