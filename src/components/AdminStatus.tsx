"use client";

import { useEffect, useState } from "react";

function SaveRow({ busy, status }: { busy: boolean; status: string | null }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="submit"
        disabled={busy}
        className="border-2 border-border bg-accent px-4 py-1 text-sm text-accent-contrast enabled:hover:bg-accent-hover disabled:opacity-50"
      >
        {busy ? "saving..." : "save"}
      </button>
      {status && (
        <span className="font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
          {status}
        </span>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-2 border-border bg-surface" style={{ boxShadow: "4px 4px 0 0 var(--border)" }}>
      <div className="border-b-2 border-border bg-title-bar px-3 py-2 font-heading text-lg text-title-bar-text" style={{ fontFamily: "var(--font-heading)" }}>
        {title}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function AdminStatus() {
  const [awayBody, setAwayBody] = useState("");
  const [awayStatus, setAwayStatus] = useState<string | null>(null);
  const [awayBusy, setAwayBusy] = useState(false);

  const [mood, setMood] = useState("");
  const [moodStatus, setMoodStatus] = useState<string | null>(null);
  const [moodBusy, setMoodBusy] = useState(false);

  const [reading, setReading] = useState("");
  const [watching, setWatching] = useState("");
  const [listening, setListening] = useState("");
  const [thinking, setThinking] = useState("");
  const [currentlyStatus, setCurrentlyStatus] = useState<string | null>(null);
  const [currentlyBusy, setCurrentlyBusy] = useState(false);

  const [cdLabel, setCdLabel] = useState("");
  const [cdDate, setCdDate] = useState("");
  const [cdMode, setCdMode] = useState<"since" | "until">("since");
  const [cdVisible, setCdVisible] = useState(false);
  const [cdBusy, setCdBusy] = useState(false);
  const [cdStatus, setCdStatus] = useState<string | null>(null);

  const [spotifyConnected, setSpotifyConnected] = useState<boolean | null>(null);
  const [nudgeCount, setNudgeCount] = useState<number | null>(null);
  const [lastNudged, setLastNudged] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/away-message")
      .then((r) => r.json())
      .then((d: { away_message?: { body: string } | null }) => {
        if (d.away_message?.body) setAwayBody(d.away_message.body);
      })
      .catch(() => null);

    fetch("/api/mood")
      .then((r) => r.json())
      .then((d: { mood?: { mood: string } | null }) => {
        if (d.mood?.mood) setMood(d.mood.mood);
      })
      .catch(() => null);

    fetch("/api/currently")
      .then((r) => r.json())
      .then((d: { currently?: { reading?: string; watching?: string; listening?: string; thinking?: string } | null }) => {
        if (d.currently) {
          setReading(d.currently.reading ?? "");
          setWatching(d.currently.watching ?? "");
          setListening(d.currently.listening ?? "");
          setThinking(d.currently.thinking ?? "");
        }
      })
      .catch(() => null);

    fetch("/api/countdown")
      .then((r) => r.json())
      .then((d: { countdown?: { label: string; target_date: string | null; mode: "since" | "until"; is_visible: boolean } | null }) => {
        if (d.countdown) {
          setCdLabel(d.countdown.label ?? "");
          setCdDate(d.countdown.target_date ?? "");
          setCdMode(d.countdown.mode ?? "since");
          setCdVisible(d.countdown.is_visible ?? false);
        }
      })
      .catch(() => null);

    fetch("/api/spotify/now-playing")
      .then((r) => r.json())
      .then((d: { track?: unknown }) => { setSpotifyConnected("track" in d); })
      .catch(() => setSpotifyConnected(false));

    fetch("/api/nudge", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { count?: number; last_nudged_at?: string | null }) => {
        setNudgeCount(d.count ?? 0);
        setLastNudged(d.last_nudged_at ?? null);
      })
      .catch(() => null);
  }, []);

  async function saveAway(e: React.FormEvent) {
    e.preventDefault();
    setAwayBusy(true); setAwayStatus(null);
    try {
      const res = await fetch("/api/away-message", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ body: awayBody }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setAwayStatus(res.ok ? "saved!" : (d.error ?? "error"));
    } finally { setAwayBusy(false); }
  }

  async function saveMood(e: React.FormEvent) {
    e.preventDefault();
    setMoodBusy(true); setMoodStatus(null);
    try {
      const res = await fetch("/api/mood", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ mood }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setMoodStatus(res.ok ? "saved!" : (d.error ?? "error"));
    } finally { setMoodBusy(false); }
  }

  async function saveCurrently(e: React.FormEvent) {
    e.preventDefault();
    setCurrentlyBusy(true); setCurrentlyStatus(null);
    try {
      const res = await fetch("/api/currently", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ reading, watching, listening, thinking }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setCurrentlyStatus(res.ok ? "saved!" : (d.error ?? "error"));
    } finally { setCurrentlyBusy(false); }
  }

  async function saveCountdown(e: React.FormEvent) {
    e.preventDefault();
    setCdBusy(true); setCdStatus(null);
    try {
      const res = await fetch("/api/countdown", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ label: cdLabel, target_date: cdDate || null, mode: cdMode, is_visible: cdVisible }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setCdStatus(res.ok ? "saved!" : (d.error ?? "error"));
    } finally { setCdBusy(false); }
  }

  const inputClass =
    "mt-1 w-full border-2 border-border bg-page-bg px-3 py-2 font-mono text-sm text-text focus:outline-none focus:border-accent";

  return (
    <div className="space-y-8">
      {/* Away message */}
      <Section title="away message">
        <form onSubmit={(e) => void saveAway(e)} className="space-y-3">
          <p className="font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
            shown on the homepage. clear to hide.
          </p>
          <textarea
            value={awayBody} onChange={(e) => setAwayBody(e.target.value)}
            rows={3} maxLength={300} placeholder="brb getting snacks..."
            className={inputClass} style={{ fontFamily: "var(--font-mono-chat)", resize: "vertical" }}
          />
          <SaveRow busy={awayBusy} status={awayStatus} />
        </form>
      </Section>

      {/* Mood */}
      <Section title="current mood">
        <form onSubmit={(e) => void saveMood(e)} className="space-y-3">
          <p className="font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
            one line, shown below your away message. e.g. &ldquo;☕ caffeinated&rdquo; or &ldquo;🌙 cozy&rdquo;
          </p>
          <input
            type="text" maxLength={80} value={mood} onChange={(e) => setMood(e.target.value)}
            placeholder="🌙 sleepy"
            className={inputClass} style={{ fontFamily: "var(--font-mono-chat)" }}
          />
          <SaveRow busy={moodBusy} status={moodStatus} />
        </form>
      </Section>

      {/* Currently */}
      <Section title="currently">
        <form onSubmit={(e) => void saveCurrently(e)} className="space-y-3">
          <p className="font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
            shown on the homepage. leave blank to hide a row.
          </p>
          {([ ["reading", reading, setReading], ["watching", watching, setWatching],
              ["listening", listening, setListening], ["thinking", thinking, setThinking],
            ] as [string, string, (v: string) => void][]).map(([label, value, setter]) => (
            <div key={label}>
              <label className="block font-mono text-xs uppercase tracking-widest text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
                {label}
              </label>
              <input
                type="text" maxLength={120} value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={`what you're ${label}...`}
                className={inputClass} style={{ fontFamily: "var(--font-mono-chat)" }}
              />
            </div>
          ))}
          <SaveRow busy={currentlyBusy} status={currentlyStatus} />
        </form>
      </Section>

      {/* Countdown */}
      <Section title="✦ countdown / days since">
        <form onSubmit={(e) => void saveCountdown(e)} className="space-y-3">
          <p className="font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
            shows a small banner on the homepage, e.g. &ldquo;day 47 of keeping this site alive&rdquo;.
          </p>
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>label</label>
            <input type="text" maxLength={80} value={cdLabel} onChange={(e) => setCdLabel(e.target.value)}
              placeholder="keeping this site alive"
              className={inputClass} style={{ fontFamily: "var(--font-mono-chat)" }} />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>date</label>
            <input type="date" value={cdDate} onChange={(e) => setCdDate(e.target.value)}
              className={inputClass} style={{ fontFamily: "var(--font-mono-chat)" }} />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-1" style={{ fontFamily: "var(--font-mono-chat)" }}>mode</label>
            <div className="flex gap-4">
              {(["since", "until"] as const).map((m) => (
                <label key={m} className="flex items-center gap-1.5 font-mono text-sm text-text cursor-pointer" style={{ fontFamily: "var(--font-mono-chat)" }}>
                  <input type="radio" name="cd-mode" value={m} checked={cdMode === m} onChange={() => setCdMode(m)} />
                  {m === "since" ? "days since (counts up)" : "countdown until (counts down)"}
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 font-mono text-sm text-text cursor-pointer" style={{ fontFamily: "var(--font-mono-chat)" }}>
            <input type="checkbox" checked={cdVisible} onChange={(e) => setCdVisible(e.target.checked)} />
            show on homepage
          </label>
          <SaveRow busy={cdBusy} status={cdStatus} />
        </form>
      </Section>

      {/* Spotify */}
      <Section title="♪ spotify now playing">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs" style={{ fontFamily: "var(--font-mono-chat)" }}>status:</span>
            {spotifyConnected === null ? (
              <span className="font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>checking...</span>
            ) : spotifyConnected ? (
              <span className="font-mono text-xs text-link" style={{ fontFamily: "var(--font-mono-chat)" }}>✓ connected</span>
            ) : (
              <span className="font-mono text-xs text-accent" style={{ fontFamily: "var(--font-mono-chat)" }}>✗ not connected</span>
            )}
          </div>
          {!spotifyConnected && (
            <div className="border border-border bg-page-bg p-3 font-mono text-xs text-muted space-y-1" style={{ fontFamily: "var(--font-mono-chat)" }}>
              <p className="font-semibold text-text">Setup steps:</p>
              <ol className="list-decimal list-inside space-y-1 mt-1">
                <li>Go to <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-link underline">developer.spotify.com/dashboard</a> and create an app</li>
                <li>Add <code className="bg-surface px-1">http://localhost:3000/api/spotify/callback</code> as a Redirect URI</li>
                <li>Add <code className="bg-surface px-1">SPOTIFY_CLIENT_ID</code> and <code className="bg-surface px-1">SPOTIFY_CLIENT_SECRET</code> to .env.local</li>
                <li>Restart the dev server, then click Connect below</li>
                <li>Copy the SPOTIFY_REFRESH_TOKEN shown and add it to .env.local</li>
              </ol>
            </div>
          )}
          <a href="/api/spotify/auth" className="inline-block border-2 border-border bg-accent px-4 py-1 text-sm text-accent-contrast no-underline hover:bg-accent-hover">
            {spotifyConnected ? "re-connect spotify" : "connect spotify"}
          </a>
        </div>
      </Section>

      {/* Nudges */}
      <Section title="✦ nudges">
        <div className="space-y-2">
          {nudgeCount === null ? (
            <p className="font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>loading...</p>
          ) : (
            <>
              <p className="font-mono text-sm text-text" style={{ fontFamily: "var(--font-mono-chat)" }}>
                total nudges received: <span className="text-accent font-bold">{nudgeCount}</span>
              </p>
              {lastNudged && (
                <p className="font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
                  last nudged:{" "}
                  {new Date(lastNudged).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  {" at "}
                  {new Date(lastNudged).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </p>
              )}
            </>
          )}
        </div>
      </Section>
    </div>
  );
}
