"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getSeen, hasNew, setSeen } from "@/lib/new-content";
import { SearchBox } from "@/components/SearchBox";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { AimSoundsToggle } from "@/components/AimSoundsToggle";
import { CursorSparkle } from "@/components/CursorSparkle";
import { HoverSounds } from "@/components/HoverSounds";
import { DialUpSplash } from "@/components/DialUpSplash";

const NAV_LINKS = [
  { href: "/", label: "~* homepage *~", exact: true },
  { href: "/live", label: "livefeed" },
  { href: "/board", label: "pinboard" },
  { href: "/ask", label: "ask" },
  { href: "/guestbook", label: "guestbook" },
  { href: "/about", label: "about" },
  { href: "/stamps", label: "i was here" },
  { href: "/links", label: "links" },
  { href: "/stats", label: "stats" },
];

/** Nav pages that show a "new" badge when fresh content has been posted since the last visit. */
const TRACKED = ["/", "/live", "/guestbook"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [latest, setLatest] = useState<Record<string, string | null>>({});
  const [newHrefs, setNewHrefs] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/latest")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => {
        if (!cancelled) setLatest(data as Record<string, string | null>);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (Object.keys(latest).length === 0) return;
    const now = new Date().toISOString();
    const fresh: string[] = [];
    for (const href of TRACKED) {
      const seen = getSeen(href);
      const visiting = href === "/" ? pathname === "/" : pathname.startsWith(href);
      if (!visiting && hasNew(latest[href], seen)) fresh.push(href);
      // Mark as seen when visiting, and set a baseline the first time we ever see a page.
      if (visiting || seen === null) setSeen(href, latest[href] ?? now);
    }
    setNewHrefs(fresh);
  }, [latest, pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <CursorSparkle />
      <HoverSounds />
      <DialUpSplash />
      {/* Marquee-style status bar */}
      <div
        className="bg-accent text-accent-contrast font-mono py-0.5 overflow-hidden"
        style={{
          fontFamily: "var(--font-mono-chat)",
          fontSize: 10,
          letterSpacing: "0.08em",
        }}
      >
        <span className="marquee-track">
          <span className="pr-16">★ you have (1) new message ★ &nbsp;&nbsp; aol instant messenger &nbsp;&nbsp; ★ welcome to my page ★ &nbsp;&nbsp; hope you have fun xx &nbsp;&nbsp; ★ sign my guestbook ★ &nbsp;&nbsp; away message: probably online &nbsp;&nbsp;</span>
          <span className="pr-16">★ you have (1) new message ★ &nbsp;&nbsp; aol instant messenger &nbsp;&nbsp; ★ welcome to my page ★ &nbsp;&nbsp; hope you have fun xx &nbsp;&nbsp; ★ sign my guestbook ★ &nbsp;&nbsp; away message: probably online &nbsp;&nbsp;</span>
        </span>
      </div>

      <header className="border-b-2 border-border bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto sm:flex-wrap sm:gap-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {NAV_LINKS.map(({ href, label, exact }, i) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <span key={href} className="flex items-center gap-2">
                  {i > 0 && <span className="text-muted select-none">-+-</span>}
                  <Link
                    href={href}
                    className={`font-heading text-xl tracking-wide no-underline hover:text-accent ${active ? "text-accent underline" : "text-text"}`}
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {label}
                  </Link>
                  {newHrefs.includes(href) && (
                    <span
                      className="border border-border bg-accent px-1 font-mono text-[9px] uppercase leading-tight text-accent-contrast"
                      style={{ fontFamily: "var(--font-mono-chat)" }}
                      title="new since your last visit"
                    >
                      new
                    </span>
                  )}
                </span>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <SearchBox />
            <AimSoundsToggle />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-4 sm:py-8 animate-fade-in">
        {children}
      </main>

      <footer className="border-t-2 border-border bg-surface">
        <div
          className="mx-auto max-w-5xl px-4 py-3 text-center font-mono text-[10px] text-muted"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          ✦ made with &lt;3 &nbsp;|&nbsp; best viewed at 800x600 &nbsp;|&nbsp;
          member since 2026 &nbsp;|&nbsp;{" "}
          <Link href="/privacy" className="text-muted hover:text-accent">
            privacy
          </Link>{" "}
          ✦
        </div>
      </footer>
    </div>
  );
}
