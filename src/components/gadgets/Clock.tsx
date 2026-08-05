"use client";

import { GadgetWindow } from "@/components/gadgets/GadgetWindow";
import { useEffect, useState } from "react";

export function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <GadgetWindow title="clock">
      <div className="p-3 text-center">
        <p
          className="font-mono text-xl font-bold tabular-nums text-accent"
          style={{ fontFamily: "var(--font-mono-chat)" }}
          suppressHydrationWarning
        >
          {now
            ? now.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            : "--:--:--"}
        </p>
        <p
          className="mt-1 font-mono text-[10px] text-muted"
          style={{ fontFamily: "var(--font-mono-chat)" }}
          suppressHydrationWarning
        >
          {now
            ? now.toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
              })
            : ""}
        </p>
      </div>
    </GadgetWindow>
  );
}
