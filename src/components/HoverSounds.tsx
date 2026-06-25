"use client";

import { useEffect } from "react";
import { playTick } from "@/lib/aim-sounds";

export function HoverSounds() {
  useEffect(() => {
    let last: EventTarget | null = null;

    function onMouseOver(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("button, a, [role='button']");
      if (target && target !== last) {
        last = target;
        playTick();
      } else if (!target) {
        last = null;
      }
    }

    document.addEventListener("mouseover", onMouseOver, { passive: true });
    return () => document.removeEventListener("mouseover", onMouseOver);
  }, []);

  return null;
}
