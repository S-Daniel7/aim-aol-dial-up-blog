"use client";

import { useEffect } from "react";

const CHARS = ["✦", "★", "✧", "·", "✦", "✧"];

export function CursorSparkle() {
  useEffect(() => {
    let lastFire = 0;

    function onMove(e: MouseEvent) {
      const now = Date.now();
      if (now - lastFire < 45) return;
      lastFire = now;

      const el = document.createElement("span");
      el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
      const size = 7 + Math.random() * 8;
      el.style.cssText = [
        "position:fixed",
        `left:${e.clientX + (Math.random() - 0.5) * 16}px`,
        `top:${e.clientY + (Math.random() - 0.5) * 16}px`,
        "pointer-events:none",
        "user-select:none",
        `font-size:${size}px`,
        "color:var(--accent)",
        "opacity:1",
        "z-index:9999",
        "transition:opacity 0.55s ease,transform 0.55s ease",
        "will-change:opacity,transform",
      ].join(";");
      document.body.appendChild(el);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.opacity = "0";
          el.style.transform = `translateY(-${14 + Math.random() * 18}px) rotate(${(Math.random() - 0.5) * 40}deg)`;
        });
      });

      setTimeout(() => el.remove(), 600);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return null;
}
