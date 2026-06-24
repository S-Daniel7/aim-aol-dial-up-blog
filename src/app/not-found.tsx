import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[55vh] items-center justify-center p-8">
      <div
        className="w-full max-w-xs border-2 border-border bg-surface animate-fade-in"
        style={{ boxShadow: "6px 6px 0 0 var(--border)" }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between border-b-2 border-border bg-title-bar px-2 py-1.5"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span className="font-heading text-sm text-title-bar-text">
            AOL Instant Messenger
          </span>
          <div className="flex gap-1 text-[10px] text-title-bar-text/70">
            <span className="border border-current px-1 cursor-default select-none">_</span>
            <span className="border border-current px-1 cursor-default select-none">□</span>
            <span className="border border-current px-1 cursor-default select-none">×</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="flex gap-4 items-start">
            <span className="shrink-0 text-4xl leading-none select-none" aria-hidden>
              🤷
            </span>
            <div className="space-y-1.5 min-w-0">
              <p
                className="font-heading text-lg text-accent"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                user not found
              </p>
              <p
                className="font-mono text-sm text-text leading-relaxed"
                style={{ fontFamily: "var(--font-mono-chat)" }}
              >
                this page doesn&apos;t exist. maybe they went away?
              </p>
              <p
                className="font-mono text-[10px] text-muted"
                style={{ fontFamily: "var(--font-mono-chat)" }}
              >
                error 404 · this page is not here
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-border pt-4 flex items-center justify-between">
            <p
              className="font-mono text-[10px] text-muted"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >
              away message: lost in cyberspace
            </p>
            <Link
              href="/"
              className="border-2 border-border bg-accent px-3 py-1 font-heading text-sm text-accent-contrast no-underline hover:bg-accent-hover"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              go home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
