"use client";

import { useState } from "react";

export function NudgeButton() {
  const [shaking, setShaking] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "limited">("idle");

  async function nudge() {
    if (shaking || status === "limited") return;
    setShaking(true);
    setTimeout(() => setShaking(false), 500);

    try {
      const res = await fetch("/api/nudge", { method: "POST" });
      if (res.status === 429) {
        setStatus("limited");
        return;
      }
      setStatus("sent");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      // silently fail
    }
  }

  return (
    <span className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => void nudge()}
        disabled={status === "limited"}
        className={`font-mono text-[9px] text-muted hover:text-accent transition-colors disabled:opacity-40 ${shaking ? "aim-shake" : ""}`}
        style={{ fontFamily: "var(--font-mono-chat)" }}
        title="send a nudge"
      >
        ✦ nudge
      </button>
      {status === "sent" && (
        <span className="font-mono text-[9px] text-accent animate-fade-in" style={{ fontFamily: "var(--font-mono-chat)" }}>
          nudge sent!
        </span>
      )}
      {status === "limited" && (
        <span className="font-mono text-[9px] text-muted animate-fade-in" style={{ fontFamily: "var(--font-mono-chat)" }}>
          easy there
        </span>
      )}
    </span>
  );
}
