"use client";

import { playDing } from "@/lib/aim-sounds";
import { useEffect, useState } from "react";

type PublicComment = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

const mono = { fontFamily: "var(--font-mono-chat)" };

export function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<PublicComment[] | null>(null);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [website, setWebsite] = useState(""); // honeypot, must stay empty
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  // Fetched on the client so the (cached) post page still shows fresh approvals.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/comments?postId=${postId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { comments?: PublicComment[] }) => {
        if (!cancelled) setComments(d.comments ?? []);
      })
      .catch(() => {
        if (!cancelled) setComments([]);
      });
    return () => {
      cancelled = true;
    };
  }, [postId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, author_name: name, body: text, website }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(d.error ?? "Something went wrong");
        return;
      }
      playDing();
      setSent(true);
      setText("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="mb-8 border-2 border-border bg-surface"
      style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
    >
      <div
        className="border-b-2 border-border bg-title-bar px-3 py-2 font-heading text-lg text-title-bar-text"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        comments {comments ? `(${comments.length})` : ""}
      </div>

      <div className="space-y-3 p-4">
        {comments === null ? (
          <p className="text-xs text-muted" style={mono}>loading...</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-muted" style={mono}>no comments yet. be the first!</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="text-sm" style={mono}>
                <span className="font-bold text-accent">{c.author_name}</span>
                <span className="ml-2 text-[10px] text-muted">
                  {new Date(c.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                </span>
                <p className="whitespace-pre-wrap text-text">{c.body}</p>
              </li>
            ))}
          </ul>
        )}

        {sent ? (
          <p className="border-t-2 border-border pt-3 text-xs text-muted" style={mono}>
            thanks! your comment will show up once it&apos;s approved.{" "}
            <button type="button" onClick={() => setSent(false)} className="text-link underline">
              write another
            </button>
          </p>
        ) : (
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-2 border-t-2 border-border pt-3">
            <input
              required
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="screen name"
              aria-label="Screen name"
              className="w-full border-2 border-border bg-page-bg px-3 py-1.5 text-sm text-text focus:border-accent focus:outline-none sm:w-64"
              style={mono}
            />
            <textarea
              required
              maxLength={500}
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="leave a comment..."
              aria-label="Comment"
              className="w-full border-2 border-border bg-page-bg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
              style={{ ...mono, resize: "vertical" }}
            />
            {/* Honeypot: hidden from people and assistive tech. */}
            <input
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
              name="website"
            />
            {error ? (
              <p className="text-xs text-accent" style={mono}>!! {error}</p>
            ) : null}
            <button
              type="submit"
              disabled={busy}
              className="btn-press border-2 border-border bg-accent px-4 py-1 font-heading text-base text-accent-contrast enabled:hover:bg-accent-hover disabled:opacity-50"
              style={{ fontFamily: "var(--font-heading)", boxShadow: "2px 2px 0 0 var(--border)" }}
            >
              {busy ? "sending..." : "[ post comment ]"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
