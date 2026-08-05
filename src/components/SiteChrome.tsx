"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchBox } from "@/components/SearchBox";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { AimSoundsToggle } from "@/components/AimSoundsToggle";
import { CursorSparkle } from "@/components/CursorSparkle";
import { HoverSounds } from "@/components/HoverSounds";

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

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen flex flex-col">
      <CursorSparkle />
      <HoverSounds />
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
          member since 2026 ✦
        </div>
      </footer>
    </div>
  );
}
