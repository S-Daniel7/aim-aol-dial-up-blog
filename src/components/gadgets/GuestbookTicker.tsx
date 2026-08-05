"use client";

import { GadgetWindow } from "@/components/gadgets/GadgetWindow";
import type { GuestbookEntry } from "@/lib/types";
import Link from "next/link";
import { useEffect, useState } from "react";

export function GuestbookTicker({ entries }: { entries: GuestbookEntry[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (entries.length <= 1) return;
    const id = setInterval(
      () => setI((n) => (n + 1) % entries.length),
      3500,
    );
    return () => clearInterval(id);
  }, [entries.length]);

  const accessory = (
    <Link
      href="/guestbook"
      className="font-mono text-[9px] text-title-bar-text no-underline opacity-70 hover:opacity-100"
      style={{ fontFamily: "var(--font-mono-chat)" }}
    >
      sign it →
    </Link>
  );

  if (entries.length === 0) {
    return (
      <GadgetWindow title="guestbook" accessory={accessory}>
        <div className="p-3">
          <p
            className="font-mono text-[10px] text-muted"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            no signatures yet — be the first!
          </p>
        </div>
      </GadgetWindow>
    );
  }

  const entry = entries[i];

  return (
    <GadgetWindow title="guestbook" accessory={accessory}>
      <div className="p-3">
        <div key={entry.id} className="animate-fade-in">
          <p
            className="font-mono text-[11px] font-semibold text-accent"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            {entry.author_name}
          </p>
          <p
            className="mt-0.5 line-clamp-3 font-mono text-[10px] text-text leading-relaxed"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            {entry.body}
          </p>
        </div>
        {entries.length > 1 && (
          <div className="mt-2 flex justify-center gap-1" aria-hidden>
            {entries.map((e, n) => (
              <span
                key={e.id}
                className={`inline-block h-1 w-1 rounded-full ${n === i ? "bg-accent" : "bg-border"}`}
              />
            ))}
          </div>
        )}
      </div>
    </GadgetWindow>
  );
}
