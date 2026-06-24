"use client";

import { useEffect, useState } from "react";

function formatCount(n: number): string {
  return n.toString().padStart(6, "0");
}

export function HitCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/hits", { method: "POST" })
      .then((r) => r.json())
      .then((d: { count?: number | null }) => {
        if (typeof d.count === "number") setCount(d.count);
      })
      .catch(() => null);
  }, []);

  if (count === null) return null;

  return (
    <p
      className="font-mono text-xs text-muted"
      style={{ fontFamily: "var(--font-mono-chat)" }}
    >
      you are visitor{" "}
      <span className="tabular-nums text-text">#{formatCount(count)}</span>
    </p>
  );
}
