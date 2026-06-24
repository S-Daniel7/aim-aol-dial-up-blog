"use client";

import { useEffect, useState } from "react";

const VALID_EMOJI = [
  "✨","🌙","⭐","💫","🌸","💜","🖤","💀","🌻","🎵",
  "🦋","❤️","🌊","🔮","🌈","🕷️","🍄","🌿","🫧","🐚",
];

type Stamp = { id: string; word: string; emoji: string | null; created_at: string };

function getRotation(id: string): number {
  const n = parseInt(id.replace(/-/g, "").slice(-3), 16);
  return (n % 13) - 6;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function StampCard({ stamp }: { stamp: Stamp }) {
  const rot = getRotation(stamp.id);
  return (
    <div
      className="inline-flex flex-col items-center gap-1 border-2 border-border bg-surface px-3 py-2 text-center"
      style={{
        transform: `rotate(${rot}deg)`,
        boxShadow: "2px 2px 0 0 var(--border)",
        minWidth: 72,
      }}
    >
      {stamp.emoji && <span className="text-lg leading-none">{stamp.emoji}</span>}
      <span
        className="font-mono text-xs text-text leading-tight break-all"
        style={{ fontFamily: "var(--font-mono-chat)" }}
      >
        {stamp.word}
      </span>
      <span
        className="font-mono text-[8px] text-muted"
        style={{ fontFamily: "var(--font-mono-chat)" }}
      >
        {formatDate(stamp.created_at)}
      </span>
    </div>
  );
}

export function StampWall() {
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [word, setWord] = useState("");
  const [emoji, setEmoji] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/stamps")
      .then((r) => r.json())
      .then((d: { stamps?: Stamp[] }) => {
        setStamps(d.stamps ?? []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!word.trim()) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/stamps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: word.trim(), emoji }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) { setError(d.error ?? "something went wrong"); return; }
      setDone(true);
      setWord(""); setEmoji(null);
      // Prepend optimistically
      setStamps((prev) => [
        { id: crypto.randomUUID(), word: word.trim(), emoji, created_at: new Date().toISOString() },
        ...prev,
      ]);
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-8">
      {/* Form */}
      {!done ? (
        <div
          className="border-2 border-border bg-surface"
          style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
        >
          <div
            className="border-b-2 border-border bg-title-bar px-3 py-2 font-heading text-lg text-title-bar-text"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            leave your mark
          </div>
          <form onSubmit={(e) => void submit(e)} className="p-4 space-y-4">
            <div>
              <label
                className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-1"
                style={{ fontFamily: "var(--font-mono-chat)" }}
              >
                your word (max 2 words, 20 chars)
              </label>
              <input
                type="text"
                maxLength={20}
                required
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="wandering"
                className="w-full border-2 border-border bg-page-bg px-3 py-2 font-mono text-sm text-text focus:outline-none focus:border-accent"
                style={{ fontFamily: "var(--font-mono-chat)" }}
              />
            </div>
            <div>
              <p
                className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2"
                style={{ fontFamily: "var(--font-mono-chat)" }}
              >
                optional emoji
              </p>
              <div className="flex flex-wrap gap-1.5">
                {VALID_EMOJI.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(emoji === e ? null : e)}
                    className={`border border-border px-1.5 py-0.5 text-base transition-colors
                      ${emoji === e ? "bg-accent border-accent" : "bg-page-bg hover:bg-surface-2"}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            {error && (
              <p className="font-mono text-xs text-accent" style={{ fontFamily: "var(--font-mono-chat)" }}>
                !! {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy || !word.trim()}
              className="btn-press border-2 border-border bg-accent px-5 py-2 font-heading text-lg text-accent-contrast enabled:hover:bg-accent-hover disabled:opacity-50"
              style={{ fontFamily: "var(--font-heading)", boxShadow: "2px 2px 0 0 var(--border)" }}
            >
              {busy ? "stamping..." : "[ leave stamp ]"}
            </button>
          </form>
        </div>
      ) : (
        <div
          className="border-2 border-border bg-surface p-4"
          style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
        >
          <p className="font-heading text-xl text-accent" style={{ fontFamily: "var(--font-heading)" }}>
            ✓ stamp left!
          </p>
          <p className="mt-1 font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
            you&apos;re part of the wall now :) come back tomorrow to stamp again.
          </p>
        </div>
      )}

      {/* Wall */}
      <div>
        <p
          className="mb-4 border-b-2 border-border pb-2 font-heading text-xl text-text"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {loaded ? `${stamps.length} ${stamps.length === 1 ? "visitor" : "visitors"}` : "loading..."}
        </p>
        {stamps.length > 0 ? (
          <div className="flex flex-wrap gap-3 items-start">
            {stamps.map((stamp) => (
              <StampCard key={stamp.id} stamp={stamp} />
            ))}
          </div>
        ) : loaded ? (
          <p className="font-mono text-sm text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
            no stamps yet — be the first!
          </p>
        ) : null}
      </div>
    </div>
  );
}
