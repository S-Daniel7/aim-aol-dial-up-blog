"use client";

import { GadgetWindow } from "@/components/gadgets/GadgetWindow";
import { useEffect, useState } from "react";

function fmt(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function DialUpStatus() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - start) / 1000)),
      1000,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <GadgetWindow title="connection">
      <div className="space-y-2 p-3">
        <div className="flex items-center gap-2">
          <span className="online-dot" aria-hidden />
          <span
            className="font-mono text-xs font-semibold text-text"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            connected · 56.6 Kbps
          </span>
        </div>
        {/* modem send/receive lights */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent"
              style={{ animationDelay: "0ms" }}
              aria-hidden
            />
            <span
              className="font-mono text-[9px] text-muted"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >
              SD
            </span>
          </span>
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent"
              style={{ animationDelay: "500ms" }}
              aria-hidden
            />
            <span
              className="font-mono text-[9px] text-muted"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >
              RD
            </span>
          </span>
        </div>
        <p
          className="border-t border-border pt-1.5 font-mono text-[10px] text-muted tabular-nums"
          style={{ fontFamily: "var(--font-mono-chat)" }}
          suppressHydrationWarning
        >
          online for {fmt(elapsed)}
        </p>
      </div>
    </GadgetWindow>
  );
}
