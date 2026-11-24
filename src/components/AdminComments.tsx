"use client";

import { useCallback, useEffect, useState } from "react";

type AdminComment = {
  id: string;
  post_id: string;
  author_name: string;
  body: string;
  status: "pending" | "approved";
  created_at: string;
  posts: { title: string; slug: string } | null;
};

const mono = { fontFamily: "var(--font-mono-chat)" };

export function AdminComments() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/comments?pending=1", {
      credentials: "include",
      cache: "no-store",
    });
    const data = (await res.json().catch(() => ({}))) as {
      comments?: AdminComment[];
      error?: string;
    };
    if (!res.ok) setStatus(data.error ?? "Could not load comments");
    setComments(data.comments ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(id: string, init: RequestInit) {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/comments/${id}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...init,
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

  const pending = comments.filter((c) => c.status === "pending");
  const approved = comments.filter((c) => c.status === "approved");

  function renderList(list: AdminComment[], isPending: boolean) {
    if (list.length === 0) {
      return (
        <p className="text-sm text-muted" style={mono}>
          {isPending ? "all caught up!" : "nothing here yet"}
        </p>
      );
    }
    return (
      <div className="space-y-3">
        {list.map((c) => (
          <div
            key={c.id}
            className="flex items-start justify-between gap-3 border-2 border-border bg-surface p-3"
            style={{ boxShadow: "2px 2px 0 0 var(--border)" }}
          >
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[10px] uppercase tracking-widest text-muted" style={mono}>
                {c.posts ? `on "${c.posts.title}"` : "on a deleted post"} ·{" "}
                {new Date(c.created_at).toLocaleString()}
              </p>
              <p className="text-sm text-text">
                <span className="font-bold text-accent">{c.author_name}</span>:{" "}
                <span className="whitespace-pre-wrap">{c.body}</span>
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void act(c.id, {
                    method: "PATCH",
                    body: JSON.stringify({ status: isPending ? "approved" : "pending" }),
                  })
                }
                className="border border-border bg-surface-2 px-2 py-1 text-xs text-link hover:bg-page-bg disabled:opacity-50"
              >
                {isPending ? "approve" : "unapprove"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (confirm("Delete this comment?")) void act(c.id, { method: "DELETE" });
                }}
                className="border border-border bg-surface-2 px-2 py-1 text-xs text-accent hover:bg-page-bg disabled:opacity-50"
              >
                delete
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {status ? (
        <p className="text-xs text-accent" style={mono}>!! {status}</p>
      ) : null}
      <section>
        <h2
          className="mb-4 border-b-2 border-border pb-2 font-heading text-xl text-text"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          waiting for approval ({pending.length})
        </h2>
        {renderList(pending, true)}
      </section>
      <section>
        <h2
          className="mb-4 border-b-2 border-border pb-2 font-heading text-xl text-text"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          approved ({approved.length})
        </h2>
        {renderList(approved, false)}
      </section>
    </div>
  );
}
