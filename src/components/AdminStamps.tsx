"use client";

import { useEffect, useState } from "react";

type Stamp = { id: string; word: string; emoji: string | null; created_at: string; is_hidden: boolean };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function AdminStamps() {
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/stamps/admin", { credentials: "include" });
      const d = (await res.json().catch(() => ({}))) as { stamps?: Stamp[] };
      setStamps(d.stamps ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function toggleHidden(id: string, current: boolean) {
    setBusy(id);
    setStatus(null);
    try {
      const res = await fetch(`/api/stamps/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_hidden: !current }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setStatus(d.error ?? "Failed");
        return;
      }
      setStamps((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_hidden: !current } : s))
      );
    } finally {
      setBusy(null);
    }
  }

  const visible = stamps.filter((s) => !s.is_hidden);
  const hidden = stamps.filter((s) => s.is_hidden);

  return (
    <div className="space-y-8">
      {status && (
        <p className="font-mono text-xs text-accent" style={{ fontFamily: "var(--font-mono-chat)" }}>
          !! {status}
        </p>
      )}
      <p className="font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
        {stamps.length} total stamps · {visible.length} visible · {hidden.length} hidden
      </p>

      {loading ? (
        <p className="font-mono text-sm text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>loading...</p>
      ) : stamps.length === 0 ? (
        <p className="font-mono text-sm text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>no stamps yet.</p>
      ) : (
        <div className="space-y-1">
          {stamps.map((stamp) => (
            <div
              key={stamp.id}
              className={`flex items-center justify-between gap-4 border border-border px-3 py-2 ${stamp.is_hidden ? "opacity-40" : "bg-surface"}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {stamp.emoji && <span className="text-base leading-none">{stamp.emoji}</span>}
                <span
                  className="font-mono text-sm text-text"
                  style={{ fontFamily: "var(--font-mono-chat)" }}
                >
                  {stamp.word}
                </span>
                {stamp.is_hidden && (
                  <span className="font-mono text-[10px] text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
                    [hidden]
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-[10px] text-muted hidden sm:inline" style={{ fontFamily: "var(--font-mono-chat)" }}>
                  {formatDate(stamp.created_at)}
                </span>
                <button
                  type="button"
                  disabled={busy === stamp.id}
                  onClick={() => void toggleHidden(stamp.id, stamp.is_hidden)}
                  className="border border-border bg-surface-2 px-2 py-0.5 font-mono text-xs text-muted hover:bg-page-bg disabled:opacity-50"
                  style={{ fontFamily: "var(--font-mono-chat)" }}
                >
                  {stamp.is_hidden ? "show" : "hide"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
