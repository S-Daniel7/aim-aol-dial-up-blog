"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type PostResult = {
  id: string;
  title: string;
  slug: string;
  blurb: string | null;
};

type MessageResult = {
  post_id: string;
  post_title: string;
  post_slug: string;
  sender: string;
  time_label: string;
  snippet: string;
};

type SearchResults = {
  posts: PostResult[];
  messages: MessageResult[];
};

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = (await res.json()) as SearchResults;
        setResults(data);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const hasResults =
    results && (results.posts.length > 0 || results.messages.length > 0);
  const empty = results && !hasResults;

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-1 border border-border bg-surface px-2 py-1">
        <span className="font-mono text-[10px] text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
          {loading ? "…" : "🔍"}
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="search logs"
          className="w-32 bg-transparent font-mono text-xs text-text placeholder:text-muted outline-none"
          style={{ fontFamily: "var(--font-mono-chat)" }}
          aria-label="Search chat logs"
        />
      </div>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-72 border-2 border-border bg-surface shadow-md"
          style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
        >
          {empty && (
            <p className="px-3 py-2 font-mono text-[10px] text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
              no results for &ldquo;{query}&rdquo;
            </p>
          )}

          {results && results.posts.length > 0 && (
            <div>
              <p className="border-b border-border bg-surface-2 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
                chat logs
              </p>
              {results.posts.map((p) => (
                <Link
                  key={p.id}
                  href={`/${p.slug}`}
                  onClick={() => { setOpen(false); setQuery(""); }}
                  className="block border-b border-border px-3 py-2 no-underline hover:bg-surface-2"
                >
                  <p className="font-heading text-sm text-accent" style={{ fontFamily: "var(--font-heading)" }}>
                    💬 {p.title}
                  </p>
                  {p.blurb && (
                    <p className="mt-0.5 font-mono text-[10px] text-muted truncate" style={{ fontFamily: "var(--font-mono-chat)" }}>
                      {p.blurb}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}

          {results && results.messages.length > 0 && (
            <div>
              <p className="border-b border-border bg-surface-2 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
                messages
              </p>
              {results.messages.map((m, i) => (
                <Link
                  key={`${m.post_id}-${i}`}
                  href={`/${m.post_slug}`}
                  onClick={() => { setOpen(false); setQuery(""); }}
                  className="block border-b border-border px-3 py-2 no-underline hover:bg-surface-2"
                >
                  <p className="font-mono text-[10px] text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
                    <span className="text-text">{m.sender}</span>
                    {m.time_label ? ` [${m.time_label}]` : ""}
                    {" · "}
                    <span className="italic">{m.post_title}</span>
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted truncate" style={{ fontFamily: "var(--font-mono-chat)" }}>
                    {m.snippet}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
