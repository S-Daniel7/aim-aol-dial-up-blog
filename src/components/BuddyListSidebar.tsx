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
            online (1)
          </span>
        </div>
        <div className="px-3 py-1">
          <div className="flex items-center gap-1.5 py-0.5">
            <span className="online-dot" aria-hidden />
            <span
              className="font-mono text-[10px] text-text"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >
              soapie
            </span>
          </div>
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
