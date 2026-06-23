"use client";

import type { GuestbookEntry } from "@/lib/types";
import { useEffect, useState } from "react";

export function AdminGuestbook() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/guestbook");
    const data = (await res.json().catch(() => ({}))) as {
      entries?: GuestbookEntry[];
    };
    setEntries(data.entries ?? []);
  }

  useEffect(() => { void load(); }, []);

  async function remove(id: string) {
    if (!confirm("Delete this guestbook entry?")) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/guestbook/${id}`, {
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

  return (
    <div className="space-y-4">
      {status ? (
        <p className="font-mono text-xs text-accent" style={{ fontFamily: "var(--font-mono-chat)" }}>
          !! {status}
        </p>
      ) : null}

      {entries.length === 0 ? (
        <p className="font-mono text-sm text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
          no entries yet
        </p>
      ) : (
        entries.map((entry) => (
          <div
            key={entry.id}
            className="border-2 border-border bg-surface p-3"
            style={{ boxShadow: "2px 2px 0 0 var(--border)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold text-sm text-text">
                    {entry.author_name}
                  </span>
                  <span
                    className="font-mono text-[10px] text-muted"
                    style={{ fontFamily: "var(--font-mono-chat)" }}
                  >
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-text whitespace-pre-wrap">{entry.body}</p>
              </div>
              <button
                type="button"
                onClick={() => void remove(entry.id)}
                disabled={busy}
                className="shrink-0 border border-border bg-surface-2 px-2 py-1 text-xs text-accent hover:bg-page-bg disabled:opacity-50"
              >
                delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
