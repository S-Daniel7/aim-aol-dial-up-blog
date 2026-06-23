"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      {/* Title bar */}
      <div
        className="border-2 border-border bg-title-bar px-3 py-1 font-heading text-xl text-title-bar-text"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        &gt;&gt; admin access
      </div>

      <div
        className="border-2 border-t-0 border-border bg-surface p-6"
        style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
      >
        <p
          className="mb-5 font-mono text-xs text-muted"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          *** authorized users only ***
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              className="block font-mono text-xs uppercase tracking-widest text-muted"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >
              e-mail address
            </label>
            <input
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border-2 border-border bg-page-bg px-3 py-2 font-mono text-sm text-text focus:outline-none focus:border-accent"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            />
          </div>

          <div>
            <label
              className="block font-mono text-xs uppercase tracking-widest text-muted"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >
              password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border-2 border-border bg-page-bg px-3 py-2 font-mono text-sm text-text focus:outline-none focus:border-accent"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            />
          </div>

          {error ? (
            <p
              className="border border-accent bg-page-bg px-3 py-2 font-mono text-xs text-accent"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >
              !! {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full border-2 border-border bg-accent py-2 font-heading text-lg text-accent-contrast enabled:hover:bg-accent-hover disabled:opacity-50"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {busy ? "connecting..." : "[ sign in ]"}
          </button>
        </form>
      </div>
    </div>
  );
}
