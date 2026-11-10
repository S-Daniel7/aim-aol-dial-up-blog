"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { playTick } from "@/lib/aim-sounds";

const SEEN_KEY = "dialup-splash-seen";
const STAGES = [
  "dialing 555-0142…",
  "negotiating with modem…",
  "verifying screen name and password…",
  "connected at 56.6 Kbps",
];
const STAGE_MS = 650;

/** First-visit "connecting" overlay. Homepage only, once per session, skippable. */
export function DialUpSplash() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (pathname !== "/") return;
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setActive(true);
  }, [pathname]);

  useEffect(() => {
    if (!active) return;
    if (stage >= STAGES.length) {
      const done = setTimeout(() => setActive(false), 500);
      return () => clearTimeout(done);
    }
    playTick();
    const t = setTimeout(() => setStage((s) => s + 1), STAGE_MS);
    return () => clearTimeout(t);
  }, [active, stage]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  if (!active) return null;

  const pct = Math.min(100, Math.round((stage / STAGES.length) * 100));

  return (
    <div
      role="dialog"
      aria-label="Connecting"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-page-bg/95 p-4"
    >
      <div
        className="w-full max-w-sm border-2 border-border bg-surface"
        style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
      >
        <div
          className="border-b-2 border-border bg-title-bar px-3 py-1.5 font-heading text-lg text-title-bar-text"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Connecting…
        </div>
        <div className="space-y-3 p-4">
          <p
            className="min-h-[1.25rem] font-mono text-xs text-text"
            style={{ fontFamily: "var(--font-mono-chat)" }}
            aria-live="polite"
          >
            {STAGES[Math.min(stage, STAGES.length - 1)]}
          </p>
          <div className="h-4 border-2 border-border bg-page-bg">
            <div
              className="h-full bg-accent transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <button
            type="button"
            onClick={() => setActive(false)}
            className="border-2 border-border bg-surface-2 px-3 py-0.5 font-mono text-[11px] text-text hover:bg-page-bg"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            skip (esc)
          </button>
        </div>
      </div>
    </div>
  );
}
