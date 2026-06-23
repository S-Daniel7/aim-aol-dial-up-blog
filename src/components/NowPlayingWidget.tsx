"use client";

import type { SpotifyTrack } from "@/app/api/spotify/now-playing/route";
import { useEffect, useState } from "react";

export function NowPlayingWidget() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);

  useEffect(() => {
    fetch("/api/spotify/now-playing")
      .then((r) => r.json())
      .then((d: { track?: SpotifyTrack | null }) => setTrack(d.track ?? null))
      .catch(() => null);
  }, []);

  if (!track) return null;

  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border-2 border-border bg-surface no-underline hover:border-accent"
      style={{ boxShadow: "3px 3px 0 0 var(--border)" }}
    >
      <div
        className="flex items-center justify-between border-b-2 border-border bg-title-bar px-2 py-1"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <span className="font-heading text-sm text-title-bar-text">
          {track.isPlaying ? "♪ now playing" : "♫ last played"}
        </span>
        <span
          className="font-mono text-[9px] text-title-bar-text opacity-60"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          open in spotify ↗
        </span>
      </div>

      <div className="flex items-center gap-3 p-3">
        {track.albumArt ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={track.albumArt}
            alt=""
            width={48}
            height={48}
            style={{ imageRendering: "pixelated", flexShrink: 0 }}
            className="border border-border"
          />
        ) : (
          <div
            className="flex shrink-0 items-center justify-center border border-border bg-surface-2"
            style={{ width: 48, height: 48, fontSize: 22 }}
          >
            ♪
          </div>
        )}

        <div className="min-w-0">
          <p
            className="truncate font-mono text-xs font-semibold text-text"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            {track.name}
          </p>
          <p
            className="truncate font-mono text-[10px] text-muted"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            {track.artist}
          </p>
        </div>
      </div>
    </a>
  );
}
