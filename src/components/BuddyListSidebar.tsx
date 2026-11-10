"use client";

import { createPublicClient } from "@/lib/supabase/public";
import { useEffect, useState } from "react";
import { playDoorClose, playDoorOpen } from "@/lib/aim-sounds";
import { getVisitorName } from "@/lib/visitor-identity";

type PresenceMeta = { name?: string; joined_at?: number };

const MAX_LISTED = 8;

const AWAY_BUDDIES: { name: string; awayMsg: string }[] = [
  { name: "glittergrrrl94", awayMsg: "brb mom said dinner is ready" },
  { name: "sk8erb0y_2k1", awayMsg: "at the skate park!!! back l8r 🛹" },
  { name: "xXxSunshinexXx", awayMsg: ":: listening to dashboard confessional ::" },
  { name: "moonbeam_xo", awayMsg: "currently: being emo about the stars 🌙" },
  { name: "punkrocker99", awayMsg: "Away" },
  { name: "aim_user_4827", awayMsg: "auto-away: idle for 15 minutes" },
];

function TitleBar() {
  return (
    <div
      className="flex items-center justify-between border-b-2 border-border bg-title-bar px-2 py-1"
      style={{ fontFamily: "var(--font-heading)" }}
    >
      <span className="font-heading text-sm text-title-bar-text">Buddy List</span>
      <div className="flex gap-1 text-[10px] opacity-80" aria-hidden>
        <span className="border border-title-bar-text px-0.5">_</span>
        <span className="border border-title-bar-text px-0.5">□</span>
        <span className="border border-title-bar-text px-0.5">×</span>
      </div>
    </div>
  );
}

export function BuddyListSidebar() {
  const [me, setMe] = useState<string | null>(null);
  const [others, setOthers] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createPublicClient();
    const myName = getVisitorName();
    setMe(myName);
    if (!supabase) return;

    const myKey = crypto.randomUUID();
    const channel = supabase.channel("visitor-presence", {
      config: { presence: { key: myKey } },
    });
    let synced = false;

    // Presence data comes from other visitors' browsers, so treat it as untrusted:
    // only accept a short plain string and fall back to a generic label.
    const nameOf = (metas: PresenceMeta[]) => {
      const n = metas[0]?.name;
      return typeof n === "string" && n.trim() ? n.trim().slice(0, 32) : "a visitor";
    };

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceMeta>();
        const names = Object.entries(state)
          .filter(([key]) => key !== myKey)
          .map(([, metas]) => nameOf(metas));
        setOthers(names.sort((a, b) => a.localeCompare(b)));
        synced = true;
      })
      .on("presence", { event: "join" }, ({ key }) => {
        // Ignore the initial burst of joins and our own join.
        if (synced && key !== myKey) playDoorOpen();
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        if (synced && key !== myKey) playDoorClose();
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ name: myName, joined_at: Date.now() });
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const onlineCount = 1 + (me ? 1 : 0) + others.length;
  const listed = others.slice(0, MAX_LISTED);
  const hiddenCount = others.length - listed.length;

  return (
    <div
      className="border-2 border-border bg-surface text-xs"
      style={{ boxShadow: "3px 3px 0 0 var(--border)" }}
    >
      <TitleBar />

      {/* My screen name */}
      <div className="border-b border-border bg-surface-2 px-2 py-1.5">
        <div className="flex items-center gap-1.5">
          <span className="online-dot" aria-hidden />
          <span
            className="font-heading text-base text-accent"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            soapie
          </span>
        </div>
        <p
          className="mt-0.5 font-mono text-[9px] text-muted leading-tight"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          ★ probably online ★
        </p>
      </div>

      {/* Online group */}
      <div className="border-b border-border">
        <div className="flex items-center gap-1 bg-surface-2 px-2 py-1">
          <span className="text-muted">▾</span>
          <span
            className="font-mono text-[9px] uppercase tracking-widest text-muted"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            online ({onlineCount})
          </span>
        </div>
        <div className="px-3 py-1" aria-live="polite">
          <div className="flex items-center gap-1.5 py-0.5">
            <span className="online-dot" aria-hidden />
            <span
              className="font-mono text-[10px] text-text"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >
              soapie
            </span>
          </div>
          {me && (
            <div className="flex items-center gap-1.5 py-0.5">
              <span className="online-dot" aria-hidden />
              <span
                className="font-mono text-[10px] text-accent truncate"
                style={{ fontFamily: "var(--font-mono-chat)" }}
                title="this is you"
              >
                {me} (you)
              </span>
            </div>
          )}
          {listed.map((name, i) => (
            <div key={`${name}-${i}`} className="flex items-center gap-1.5 py-0.5">
              <span className="online-dot" aria-hidden />
              <span
                className="font-mono text-[10px] text-text truncate"
                style={{ fontFamily: "var(--font-mono-chat)" }}
              >
                {name}
              </span>
            </div>
          ))}
          {hiddenCount > 0 && (
            <p
              className="py-0.5 font-mono text-[10px] text-muted italic"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >
              +{hiddenCount} more
            </p>
          )}
        </div>
      </div>

      {/* Away group */}
      <div>
        <div className="flex items-center gap-1 bg-surface-2 px-2 py-1">
          <span className="text-muted">▾</span>
          <span
            className="font-mono text-[9px] uppercase tracking-widest text-muted"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            away ({AWAY_BUDDIES.length})
          </span>
        </div>
        <div className="px-3 py-1 space-y-0.5">
          {AWAY_BUDDIES.map(({ name, awayMsg }) => (
            <div
              key={name}
              className="flex items-center gap-1.5 py-0.5 cursor-default"
              title={awayMsg}
            >
              <span
                className="inline-block shrink-0"
                aria-hidden
                style={{ width: 7, height: 7, border: "1px solid var(--muted)", flexShrink: 0 }}
              />
              <span
                className="font-mono text-[10px] text-muted truncate"
                style={{ fontFamily: "var(--font-mono-chat)" }}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-surface-2 px-2 py-1.5">
        <p
          className="font-mono text-[9px] text-muted text-center"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          aol instant messenger
        </p>
      </div>
    </div>
  );
}
