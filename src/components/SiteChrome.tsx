import Link from "next/link";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b-2 border-border bg-surface">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="font-heading text-xl tracking-wide text-text no-underline hover:text-accent"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              
             
              homepage
            </Link>
            <span className="text-muted">-+-</span>
            <Link
              href="/live"
              className="font-heading text-xl tracking-wide text-text no-underline hover:text-accent"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              livefeed
            </Link>
            <span className="text-muted">-+-</span>
            <Link
              href="/board"
              className="font-heading text-xl tracking-wide text-text no-underline hover:text-accent"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              
              pinboard
            </Link>
            <span className="text-muted">-+-</span>
            <Link
              href="/chat"
              className="font-heading text-xl tracking-wide text-text no-underline hover:text-accent"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              chat
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <ThemeSwitcher />
            <Link
              href="/admin"
              className="text-sm text-link no-underline hover:text-link-hover"
            >
              admin
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
