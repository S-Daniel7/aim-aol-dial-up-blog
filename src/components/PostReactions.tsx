"use client";

import { useEffect, useState } from "react";

const EMOJIS = [":-)", ":-O", "<3", ":'(", ":-P"];

type Counts = Record<string, number>;

export function PostReactions({ postId }: { postId: string }) {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [reacted, setReacted] = useState<Record<string, boolean>>({});
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/reactions?post_id=${encodeURIComponent(postId)}`)
      .then((r) => r.json())
      .then((d: { counts?: Counts }) => setCounts(d.counts ?? {}))
      .catch(() => setCounts({}));
  }, [postId]);

  async function react(emoji: string) {
    if (reacted[emoji]) return;
    // Optimistic
    setCounts((prev) => ({ ...prev, [emoji]: (prev?.[emoji] ?? 0) + 1 }));
    setReacted((prev) => ({ ...prev, [emoji]: true }));

    const res = await fetch("/api/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, emoji }),
    });

    if (!res.ok) {
      // Roll back optimistic update
      setCounts((prev) => ({ ...prev, [emoji]: Math.max(0, (prev?.[emoji] ?? 1) - 1) }));
      setReacted((prev) => ({ ...prev, [emoji]: false }));
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.status === 429) {
        setFlash(d.error ?? "already reacted!");
        setTimeout(() => setFlash(null), 2500);
      }
    }
  }

  if (counts === null) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-t border-border px-3 py-2 bg-surface-2">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => void react(emoji)}
          title={`react with ${emoji}`}
          className={`group flex items-center gap-1 border border-border px-2 py-0.5 font-mono text-xs transition-colors
            ${reacted[emoji]
              ? "bg-accent text-accent-contrast border-accent"
              : "bg-page-bg text-text hover:border-accent hover:text-accent"
            }`}
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          <span>{emoji}</span>
          {(counts[emoji] ?? 0) > 0 && (
            <span className="tabular-nums text-[10px] opacity-70">{counts[emoji]}</span>
          )}
        </button>
      ))}
      {flash && (
        <span
          className="animate-fade-in font-mono text-[10px] text-muted"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          {flash}
        </span>
      )}
    </div>
  );
}
