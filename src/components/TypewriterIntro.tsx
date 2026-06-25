"use client";

import { useEffect, useRef, useState } from "react";

const ART = `  .・。.・゜✭・.・✫・゜・。.
  welcome to my little corner of the internet
  .・。.・゜✭・.・✫・゜・。.`;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "good morning ☀️";
  if (hour >= 12 && hour < 17) return "good afternoon ✨";
  if (hour >= 17 && hour < 21) return "good evening 🌙";
  return "up late? 🌙";
}

export function TypewriterIntro() {
  const fullTextRef = useRef<string | null>(null);
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const greeting = getGreeting();
    const text = `${greeting}\n\n${ART}`;
    fullTextRef.current = text;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, 18);
    return () => clearInterval(timer);
  }, []);

  return (
    <pre
      className="mb-3 font-mono text-[11px] text-muted leading-tight"
      style={{ fontFamily: "var(--font-mono-chat)" }}
    >
      {displayed}
      {!done && <span className="blink">▌</span>}
    </pre>
  );
}
