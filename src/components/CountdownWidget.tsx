"use client";

import type { CountdownData } from "@/lib/site-widgets-db";
import { useEffect, useState } from "react";

function getDayDiff(targetDate: string): number {
  const target = new Date(targetDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
}

export function CountdownWidget({ initialData }: { initialData?: CountdownData | null }) {
  const [data, setData] = useState<CountdownData | null>(initialData ?? null);
  const [days, setDays] = useState<number | null>(null);

  // Compute days client-side only to avoid hydration mismatch
  useEffect(() => {
    if (data?.target_date) setDays(getDayDiff(data.target_date));
  }, [data]);

  // Only fetch from API if no server-side data was passed in
  useEffect(() => {
    if (initialData !== undefined) return;
    fetch("/api/countdown")
      .then((r) => r.json())
      .then((d: { countdown?: CountdownData | null }) => {
        const c = d.countdown;
        if (!c || !c.is_visible || !c.label || !c.target_date) return;
        setData(c);
      })
      .catch(() => null);
  }, [initialData]);

  useEffect(() => {
    if (!data) return;
    const id = setInterval(() => setDays(getDayDiff(data.target_date)), 60_000);
    return () => clearInterval(id);
  }, [data]);

  if (!data || days === null) return null;

  const sinceMode = data.mode === "since";
  const n = sinceMode ? days : -days;

  if (!sinceMode && n < 0) return null; // already passed for "until" mode

  let line: string;
  if (sinceMode) {
    line = n === 0 ? `today: ${data.label}` : `day ${n} of ${data.label}`;
  } else {
    line = n === 0 ? `today: ${data.label} !!` : `${n} day${n === 1 ? "" : "s"} until ${data.label}`;
  }

  return (
    <div
      className="flex items-center justify-center gap-2 border-2 border-border bg-surface px-4 py-2"
      style={{ boxShadow: "3px 3px 0 0 var(--border)" }}
    >
      <span className="blink text-accent">✦</span>
      <p
        className="font-mono text-sm text-text"
        style={{ fontFamily: "var(--font-mono-chat)" }}
      >
        {line}
      </p>
      <span className="blink text-accent">✦</span>
    </div>
  );
}
