"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function GuestbookForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author_name: name, body }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(d.error ?? "Something went wrong");
        return;
      }
      setDone(true);
      setName("");
      setBody("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "mt-1 w-full border-2 border-border bg-page-bg px-3 py-2 font-mono text-sm text-text focus:outline-none focus:border-accent";

  if (done) {
    return (
      <div
        className="border-2 border-border bg-surface p-4"
        style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
      >
        <p
          className="font-heading text-xl text-accent"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          ✓ entry signed!
        </p>
        <p
          className="mt-1 font-mono text-xs text-muted"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          ty for visiting my page :)
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-3 border border-border bg-surface-2 px-3 py-1 text-xs text-link hover:bg-page-bg"
        >
          sign again
        </button>
      </div>
    );
  }

  return (
    <div
      className="border-2 border-border bg-surface"
      style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
    >
      <div
        className="border-b-2 border-border bg-title-bar px-3 py-2 font-heading text-lg text-title-bar-text"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        sign the guestbook
      </div>
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-3 p-4">
        <div>
          <label
            className="block font-mono text-xs uppercase tracking-widest text-muted"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            name *
          </label>
          <input
            type="text"
            required
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="xXcoolkidXx"
            className={inputClass}
            style={{ fontFamily: "var(--font-mono-chat)" }}
          />
        </div>
        <div>
          <label
            className="block font-mono text-xs uppercase tracking-widest text-muted"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            message * ({body.length}/500)
          </label>
          <textarea
            required
            maxLength={500}
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="omg i love ur page!! adding u to my buddy list rn"
            className={inputClass}
            style={{ fontFamily: "var(--font-mono-chat)", resize: "vertical" }}
          />
        </div>
        {error ? (
          <p
            className="font-mono text-xs text-accent"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            !! {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="border-2 border-border bg-accent px-5 py-2 font-heading text-lg text-accent-contrast enabled:hover:bg-accent-hover disabled:opacity-50"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {busy ? "signing..." : "[ sign it! ]"}
        </button>
      </form>
    </div>
  );
}
