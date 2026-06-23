import { GuestbookForm } from "@/components/GuestbookForm";
import { getSupabasePublicConfig } from "@/lib/env";
import { fetchGuestbookEntries } from "@/lib/guestbook-db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Guestbook",
  description: "Sign my guestbook!",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function GuestbookPage() {
  const configured = !!getSupabasePublicConfig();
  const entries = configured ? await fetchGuestbookEntries() : [];

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="mb-1 font-heading text-3xl tracking-wide text-accent"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          ~* guestbook *~
        </h1>
        <p
          className="font-mono text-xs text-muted"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          leave me a message! i read every one :)
        </p>
      </div>

      <GuestbookForm />

      {entries.length > 0 && (
        <div className="space-y-3">
          <p
            className="border-b-2 border-border pb-2 font-heading text-xl text-text"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="border-2 border-border bg-surface p-3"
              style={{ boxShadow: "2px 2px 0 0 var(--border)" }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                <span
                  className="font-heading text-lg text-accent"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {entry.author_name}
                </span>
                <span
                  className="font-mono text-[10px] text-muted"
                  style={{ fontFamily: "var(--font-mono-chat)" }}
                >
                  {formatDate(entry.created_at)}
                </span>
              </div>
              <p className="text-sm text-text whitespace-pre-wrap">{entry.body}</p>
            </div>
          ))}
        </div>
      )}

      {configured && entries.length === 0 && (
        <p
          className="font-mono text-sm text-muted"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          no entries yet — be the first to sign!
        </p>
      )}
    </div>
  );
}
