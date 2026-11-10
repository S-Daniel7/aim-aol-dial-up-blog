import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "what this site collects and why",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1
          className="mb-1 font-heading text-3xl tracking-wide text-accent"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          ~* privacy *~
        </h1>
        <p className="font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
          the short, honest version
        </p>
      </div>

      <div
        className="space-y-4 border-2 border-border bg-surface p-4"
        style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
      >
        <p className="font-mono text-sm text-text leading-relaxed" style={{ fontFamily: "var(--font-mono-chat)" }}>
          this is a personal, non-commercial site. it doesn&apos;t sell anything or share data with advertisers. here&apos;s what it does collect:
        </p>
        <ul className="list-disc space-y-2 pl-5 font-mono text-sm text-text leading-relaxed" style={{ fontFamily: "var(--font-mono-chat)" }}>
          <li>
            <strong>guestbook entries</strong> — anything you submit (name, message) is stored and shown publicly on the guestbook page.
          </li>
          <li>
            <strong>basic visitor stats</strong> — page hits and approximate visitor counts, plus IP-based rate limiting on public forms (guestbook, stamps, reactions) to prevent spam.
          </li>
          <li>
            <strong>analytics</strong> — anonymous, aggregate traffic analytics via Vercel Analytics. no cross-site tracking or ad targeting.
          </li>
        </ul>
        <p className="font-mono text-sm text-text leading-relaxed" style={{ fontFamily: "var(--font-mono-chat)" }}>
          if you want something you posted removed, reach out via the{" "}
          <a href="/ask" className="text-accent hover:underline">
            ask page
          </a>{" "}
          and i&apos;ll take care of it.
        </p>
      </div>
    </div>
  );
}
