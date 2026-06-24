"use client";

import { useEffect, useState } from "react";
import { playDoorClose, playDoorOpen, setSoundsEnabled, soundsEnabled } from "@/lib/aim-sounds";

export function AimSoundsToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(soundsEnabled());
  }, []);

  function toggle() {
    const next = !on;
    setSoundsEnabled(next);
    setOn(next);
    if (next) playDoorOpen();
    else playDoorClose();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={on ? "mute AIM sounds" : "enable AIM sounds"}
      className="border border-border bg-surface-2 px-2 py-0.5 font-mono text-[10px] text-muted hover:text-text hover:bg-page-bg transition-colors"
      style={{ fontFamily: "var(--font-mono-chat)" }}
    >
      {on ? "🔊" : "🔇"}
    </button>
  );
}
