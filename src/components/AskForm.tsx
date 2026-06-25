"use client";

import { useState } from "react";
import { playDing } from "@/lib/aim-sounds";

export function AskForm() {
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(d.error ?? "Something went wrong");
        return;
      }
      playDing();
      setDone(true);
      setQuestion("");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div
        className="border-2 border-border bg-surface p-4"
        style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
      >
        <p
          className="font-heading text-xl text-accent"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          ✓ question sent!
        </p>
        <p
          className="mt-1 font-mono text-xs text-muted"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          i&apos;ll answer it when i get a chance :)
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-3 border border-border bg-surface-2 px-3 py-1 text-xs text-link hover:bg-page-bg"
        >
          ask another
        </button>
      </div>
    );
  }

  return (
    <div
      className="border-2 border-border bg-surface"
      style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
    >
      <div
        className="border-b-2 border-border bg-title-bar px-3 py-2 font-heading text-lg text-title-bar-text"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        ask me a thing
      </div>
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-3 p-4">
        <div>
          <label
            className="block font-mono text-xs uppercase tracking-widest text-muted"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            your question * ({question.length}/500)
          </label>
          <textarea
            required
            maxLength={500}
            rows={4}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="what's something you've been thinking about lately?"
            className="mt-1 w-full border-2 border-border bg-page-bg px-3 py-2 font-mono text-sm text-text focus:outline-none focus:border-accent"
            style={{ fontFamily: "var(--font-mono-chat)", resize: "vertical" }}
          />
        </div>
        {error ? (
          <p
            className="font-mono text-xs text-accent"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            !! {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="btn-press border-2 border-border bg-accent px-5 py-2 font-heading text-lg text-accent-contrast enabled:hover:bg-accent-hover disabled:opacity-50"
          style={{ fontFamily: "var(--font-heading)", boxShadow: "2px 2px 0 0 var(--border)" }}
        >
          {busy ? "sending..." : "[ send it! ]"}
        </button>
      </form>
    </div>
  );
}
