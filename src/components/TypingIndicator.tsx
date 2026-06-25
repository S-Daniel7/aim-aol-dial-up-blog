"use client";

import { useEffect, useState } from "react";

const SCREEN_NAME = "soapie";

// How long the indicator stays visible (ms)
const SHOW_DURATION = 3500;
// Min/max gap between appearances (ms)
const MIN_INTERVAL = 90_000;   // 1.5 min
const MAX_INTERVAL = 240_000;  // 4 min

function randomInterval() {
  return MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
}

export function TypingIndicator() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;
    let showTimer: ReturnType<typeof setTimeout>;

    function scheduleNext() {
      showTimer = setTimeout(() => {
        setVisible(true);
        hideTimer = setTimeout(() => {
          setVisible(false);
          scheduleNext();
        }, SHOW_DURATION);
      }, randomInterval());
    }

    scheduleNext();
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="flex items-center gap-1.5 animate-fade-in">
      <span
        className="font-mono text-[10px] text-muted"
        style={{ fontFamily: "var(--font-mono-chat)" }}
      >
        {SCREEN_NAME} is typing
      </span>
      <span className="flex items-end gap-px pb-px">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-1 w-1 rounded-full bg-muted"
            style={{ animation: `dot-pulse 1s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </span>
    </div>
  );
}
