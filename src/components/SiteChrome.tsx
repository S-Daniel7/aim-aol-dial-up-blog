import Link from "next/link";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Marquee-style status bar */}
      <div
        className="bg-accent text-accent-contrast text-center font-mono py-0.5 overflow-hidden"
        style={{
          fontFamily: "var(--font-mono-chat)",
          fontSize: 10,
          letterSpacing: "0.08em",
        }}
      >
        <span>
          ★ you have (1) new message ★ &nbsp;&nbsp; aol instant messenger
          &nbsp;&nbsp; ★ welcome to my page ★ &nbsp;&nbsp; best viewed in
          internet explorer 6 &nbsp;&nbsp; ★ you have (1) new message ★
        </span>
      </div>

      <header className="border-b-2 border-border bg-surface">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="font-heading text-xl tracking-wide text-text no-underline hover:text-accent"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              ~* homepage *~
            </Link>
            <span className="text-muted select-none">-+-</span>
            <Link
              href="/live"
              className="font-heading text-xl tracking-wide text-text no-underline hover:text-accent"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              livefeed
            </Link>
            <span className="text-muted select-none">-+-</span>
            <Link
              href="/board"
              className="font-heading text-xl tracking-wide text-text no-underline hover:text-accent"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              pinboard
            </Link>
            <span className="text-muted select-none">-+-</span>
            <Link
              href="/chat"
              className="font-heading text-xl tracking-wide text-text no-underline hover:text-accent"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              chat
            </Link>
            <span className="text-muted select-none">-+-</span>
            <Link
              href="/guestbook"
              className="font-heading text-xl tracking-wide text-text no-underline hover:text-accent"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              guestbook
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        {children}
      </main>

      <footer className="border-t-2 border-border bg-surface">
        <div
          className="mx-auto max-w-3xl px-4 py-3 text-center font-mono text-[10px] text-muted"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          ✦ made with &lt;3 &nbsp;|&nbsp; best viewed at 800x600 &nbsp;|&nbsp;
          member since 2024 ✦
        </div>
      </footer>
    </div>
  );
}
