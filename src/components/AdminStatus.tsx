"use client";

import { useEffect, useState } from "react";

export function AdminStatus() {
  const [awayBody, setAwayBody] = useState("");
  const [awayStatus, setAwayStatus] = useState<string | null>(null);
  const [awayBusy, setAwayBusy] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/away-message")
      .then((r) => r.json())
      .then((d: { away_message?: { body: string } | null }) => {
        if (d.away_message?.body) setAwayBody(d.away_message.body);
      })
      .catch(() => null);

    // Check Spotify connection by attempting a fetch; null track = not connected or nothing playing
    fetch("/api/spotify/now-playing")
      .then((r) => r.json())
      .then((d: { track?: unknown }) => {
        // If the route responds at all, Spotify keys are configured
        // We infer "connected" if the response has a track key (even if null)
        setSpotifyConnected("track" in d);
      })
      .catch(() => setSpotifyConnected(false));
  }, []);

  async function saveAway(e: React.FormEvent) {
    e.preventDefault();
    setAwayBusy(true);
    setAwayStatus(null);
    try {
      const res = await fetch("/api/away-message", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body: awayBody }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setAwayStatus(res.ok ? "saved!" : (d.error ?? "error"));
    } finally {
      setAwayBusy(false);
    }
  }

  const inputClass =
    "mt-1 w-full border-2 border-border bg-page-bg px-3 py-2 font-mono text-sm text-text focus:outline-none focus:border-accent";

  return (
    <div className="space-y-8">
      {/* Away message */}
      <div
        className="border-2 border-border bg-surface"
        style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
      >
        <div
          className="border-b-2 border-border bg-title-bar px-3 py-2 font-heading text-lg text-title-bar-text"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          away message
        </div>
        <form onSubmit={(e) => void saveAway(e)} className="space-y-3 p-4">
          <p
            className="font-mono text-xs text-muted"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            shown on the homepage when set. clear it to hide.
          </p>
          <textarea
            value={awayBody}
            onChange={(e) => setAwayBody(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="brb getting snacks..."
            className={inputClass}
            style={{ fontFamily: "var(--font-mono-chat)", resize: "vertical" }}
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={awayBusy}
              className="border-2 border-border bg-accent px-4 py-1 text-sm text-accent-contrast enabled:hover:bg-accent-hover disabled:opacity-50"
            >
              {awayBusy ? "saving..." : "save"}
            </button>
            {awayStatus ? (
              <span
                className="font-mono text-xs text-muted"
                style={{ fontFamily: "var(--font-mono-chat)" }}
              >
                {awayStatus}
              </span>
            ) : null}
          </div>
        </form>
      </div>

      {/* Spotify now playing */}
      <div
        className="border-2 border-border bg-surface"
        style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
      >
        <div
          className="border-b-2 border-border bg-title-bar px-3 py-2 font-heading text-lg text-title-bar-text"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          ♪ spotify now playing
        </div>
        <div className="space-y-4 p-4">
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-xs"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >
              status:
            </span>
            {spotifyConnected === null ? (
              <span className="font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
                checking...
              </span>
            ) : spotifyConnected ? (
              <span className="font-mono text-xs text-link" style={{ fontFamily: "var(--font-mono-chat)" }}>
                ✓ connected
              </span>
            ) : (
              <span className="font-mono text-xs text-accent" style={{ fontFamily: "var(--font-mono-chat)" }}>
                ✗ not connected
              </span>
            )}
          </div>

          {!spotifyConnected && (
            <div
              className="border border-border bg-page-bg p-3 font-mono text-xs text-muted space-y-1"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >
              <p className="font-semibold text-text">Setup steps:</p>
              <ol className="list-decimal list-inside space-y-1 mt-1">
                <li>
                  Go to{" "}
                  <a
                    href="https://developer.spotify.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link underline"
                  >
                    developer.spotify.com/dashboard
                  </a>{" "}
                  and create an app
                </li>
                <li>
                  Add <code className="bg-surface px-1">http://localhost:3000/api/spotify/callback</code> as a
                  Redirect URI
                </li>
                <li>
                  Add <code className="bg-surface px-1">SPOTIFY_CLIENT_ID</code> and{" "}
                  <code className="bg-surface px-1">SPOTIFY_CLIENT_SECRET</code> to .env.local
                </li>
                <li>Restart the dev server, then click Connect below</li>
                <li>Copy the SPOTIFY_REFRESH_TOKEN shown and add it to .env.local</li>
                <li>Restart the dev server one more time</li>
              </ol>
            </div>
          )}

          <a
            href="/api/spotify/auth"
            className="inline-block border-2 border-border bg-accent px-4 py-1 text-sm text-accent-contrast no-underline hover:bg-accent-hover"
          >
            {spotifyConnected ? "re-connect spotify" : "connect spotify"}
          </a>

          {spotifyConnected && (
            <p
              className="font-mono text-xs text-muted"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >
              the now playing widget on the homepage updates automatically from your Spotify.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
