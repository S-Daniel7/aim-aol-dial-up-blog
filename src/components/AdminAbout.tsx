"use client";

import { useEffect, useState } from "react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-2 border-border bg-surface" style={{ boxShadow: "4px 4px 0 0 var(--border)" }}>
      <div
        className="border-b-2 border-border bg-title-bar px-3 py-2 font-heading text-lg text-title-bar-text"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {title}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

type QA = { q: string; a: string };
type Interests = Record<string, string[]>;

const INTEREST_CATEGORIES = ["music", "movies", "books", "games", "other"];

const DEFAULT_INTERESTS: Interests = {
  music: ["indie rock", "shoegaze", "early 2000s pop", "mitski", "mazzy star"],
  movies: ["lost in translation", "eternal sunshine", "amélie", "ghost world"],
  books: ["the bell jar", "norwegian wood", "a little life", "piranesi"],
  games: ["animal crossing", "stardew valley", "the sims 2", "journey"],
  other: ["film photography", "thrift shopping", "late night walks", "collecting cds"],
};

const DEFAULT_FACTS = [
  "i can type ~90 wpm",
  "i have never seen a single star wars movie",
  "i keep a physical journal and have since i was 12",
  "my go-to karaoke song is 'total eclipse of the heart'",
  "i know the words to every fall out boy album from 2003–2008",
  "i still have my old tamagotchi",
];

const DEFAULT_QA: QA[] = [
  { q: "what's your sign?", a: "☿ gemini sun, pisces moon" },
  { q: "introvert or extrovert?", a: "introvert with extrovert tendencies (i crash after)" },
  { q: "coffee or tea?", a: "iced coffee at all hours, even midnight" },
  { q: "early bird or night owl?", a: "night owl. i do my best thinking at 2am" },
  { q: "if you could live anywhere?", a: "a small apartment above a bookshop in tokyo or edinburgh" },
];

const DEFAULT_BIO = `i'm a person on the internet who likes making things and collecting memories. this site is my little archive — a place to keep the conversations, thoughts, and moments i don't want to forget.

i grew up online in the AIM era, and i think some part of me never left. there's something about the old internet — small, personal, weird — that i'm trying to hold onto here.

by day i do various things. by night i'm usually reading, watching something, or falling down a rabbit hole i'll tell you about later.`;

export function AdminAbout() {
  // Profile fields
  const [avatarEmoji, setAvatarEmoji] = useState("🌙");
  const [screenName, setScreenName] = useState("soapie");
  const [memberSince, setMemberSince] = useState("2026");
  const [location, setLocation] = useState("somewhere online");
  const [age, setAge] = useState("20s");
  const [status, setStatus] = useState("away (probably)");
  const [bio, setBio] = useState(DEFAULT_BIO);

  // Interests: category → newline-separated string for editing
  const [interests, setInterests] = useState<Record<string, string>>(
    Object.fromEntries(INTEREST_CATEGORIES.map((c) => [c, (DEFAULT_INTERESTS[c] ?? []).join("\n")]))
  );

  // Fun facts: newline-separated
  const [funFacts, setFunFacts] = useState(DEFAULT_FACTS.join("\n"));

  // Q&A
  const [qas, setQas] = useState<QA[]>(DEFAULT_QA);

  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/about")
      .then((r) => r.json())
      .then((d: { about?: Record<string, unknown> | null }) => {
        if (!d.about) { setLoaded(true); return; }
        const a = d.about;
        if (typeof a.avatar_emoji === "string") setAvatarEmoji(a.avatar_emoji);
        if (typeof a.screen_name === "string") setScreenName(a.screen_name);
        if (typeof a.member_since === "string") setMemberSince(a.member_since);
        if (typeof a.location === "string") setLocation(a.location as string);
        if (typeof a.age === "string") setAge(a.age);
        if (typeof a.status === "string") setStatus(a.status);
        if (typeof a.bio === "string") setBio(a.bio);
        if (a.interests && typeof a.interests === "object") {
          const raw = a.interests as Record<string, unknown>;
          setInterests(
            Object.fromEntries(
              INTEREST_CATEGORIES.map((c) => [
                c,
                Array.isArray(raw[c]) ? (raw[c] as string[]).join("\n") : "",
              ])
            )
          );
        }
        if (Array.isArray(a.fun_facts)) setFunFacts((a.fun_facts as string[]).join("\n"));
        if (Array.isArray(a.get_to_know_me)) setQas(a.get_to_know_me as QA[]);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  async function save() {
    setBusy(true); setStatusMsg(null);
    const interestsObj = Object.fromEntries(
      INTEREST_CATEGORIES.map((c) => [
        c,
        interests[c]?.split("\n").map((s) => s.trim()).filter(Boolean) ?? [],
      ])
    );
    const facts = funFacts.split("\n").map((s) => s.trim()).filter(Boolean);

    try {
      const res = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          avatar_emoji: avatarEmoji,
          screen_name: screenName,
          member_since: memberSince,
          location,
          age,
          status,
          bio,
          interests: interestsObj,
          fun_facts: facts,
          get_to_know_me: qas.filter((qa) => qa.q.trim() || qa.a.trim()),
        }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setStatusMsg(res.ok ? "saved!" : (d.error ?? "error"));
    } finally {
      setBusy(false);
    }
  }

  function addQA() { setQas((prev) => [...prev, { q: "", a: "" }]); }
  function removeQA(i: number) { setQas((prev) => prev.filter((_, idx) => idx !== i)); }
  function updateQA(i: number, field: "q" | "a", val: string) {
    setQas((prev) => prev.map((qa, idx) => idx === i ? { ...qa, [field]: val } : qa));
  }

  const inputClass =
    "w-full border-2 border-border bg-page-bg px-3 py-2 font-mono text-sm text-text focus:outline-none focus:border-accent";
  const labelClass = "block font-mono text-[10px] uppercase tracking-widest text-muted mb-1";

  if (!loaded) {
    return (
      <p className="font-mono text-sm text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
        loading...
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile */}
      <Section title="profile card">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-mono-chat)" }}>avatar emoji</label>
            <input
              type="text" maxLength={4} value={avatarEmoji}
              onChange={(e) => setAvatarEmoji(e.target.value)}
              className={inputClass} style={{ fontFamily: "var(--font-mono-chat)" }}
            />
          </div>
          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-mono-chat)" }}>screen name</label>
            <input
              type="text" maxLength={40} value={screenName}
              onChange={(e) => setScreenName(e.target.value)}
              className={inputClass} style={{ fontFamily: "var(--font-mono-chat)" }}
            />
          </div>
          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-mono-chat)" }}>member since</label>
            <input
              type="text" maxLength={20} value={memberSince}
              onChange={(e) => setMemberSince(e.target.value)}
              className={inputClass} style={{ fontFamily: "var(--font-mono-chat)" }}
            />
          </div>
          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-mono-chat)" }}>location</label>
            <input
              type="text" maxLength={60} value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass} style={{ fontFamily: "var(--font-mono-chat)" }}
            />
          </div>
          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-mono-chat)" }}>age</label>
            <input
              type="text" maxLength={20} value={age}
              onChange={(e) => setAge(e.target.value)}
              className={inputClass} style={{ fontFamily: "var(--font-mono-chat)" }}
            />
          </div>
          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-mono-chat)" }}>status</label>
            <input
              type="text" maxLength={60} value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputClass} style={{ fontFamily: "var(--font-mono-chat)" }}
            />
          </div>
        </div>
      </Section>

      {/* Bio */}
      <Section title="bio">
        <p className="mb-2 font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
          blank lines become paragraph breaks on the page.
        </p>
        <textarea
          value={bio} onChange={(e) => setBio(e.target.value)}
          rows={8} maxLength={2000}
          className={inputClass} style={{ fontFamily: "var(--font-mono-chat)", resize: "vertical" }}
        />
      </Section>

      {/* Interests */}
      <Section title="interests">
        <p className="mb-3 font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
          one item per line per category.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INTEREST_CATEGORIES.map((cat) => (
            <div key={cat}>
              <label className={labelClass} style={{ fontFamily: "var(--font-mono-chat)" }}>{cat}</label>
              <textarea
                value={interests[cat] ?? ""}
                onChange={(e) => setInterests((prev) => ({ ...prev, [cat]: e.target.value }))}
                rows={5} maxLength={500}
                className={inputClass} style={{ fontFamily: "var(--font-mono-chat)", resize: "vertical" }}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Fun facts */}
      <Section title="fun facts">
        <p className="mb-2 font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
          one fact per line.
        </p>
        <textarea
          value={funFacts} onChange={(e) => setFunFacts(e.target.value)}
          rows={8} maxLength={2000}
          className={inputClass} style={{ fontFamily: "var(--font-mono-chat)", resize: "vertical" }}
        />
      </Section>

      {/* Get to know me */}
      <Section title="get to know me">
        <p className="mb-3 font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
          q&amp;a pairs shown on the about page.
        </p>
        <div className="space-y-3">
          {qas.map((qa, i) => (
            <div key={i} className="border border-border bg-surface-2 p-3 space-y-2">
              <div>
                <label className={labelClass} style={{ fontFamily: "var(--font-mono-chat)" }}>question</label>
                <input
                  type="text" maxLength={120} value={qa.q}
                  onChange={(e) => updateQA(i, "q", e.target.value)}
                  className={inputClass} style={{ fontFamily: "var(--font-mono-chat)" }}
                />
              </div>
              <div>
                <label className={labelClass} style={{ fontFamily: "var(--font-mono-chat)" }}>answer</label>
                <input
                  type="text" maxLength={200} value={qa.a}
                  onChange={(e) => updateQA(i, "a", e.target.value)}
                  className={inputClass} style={{ fontFamily: "var(--font-mono-chat)" }}
                />
              </div>
              <button
                type="button"
                onClick={() => removeQA(i)}
                className="font-mono text-[10px] text-muted hover:text-accent"
                style={{ fontFamily: "var(--font-mono-chat)" }}
              >
                remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addQA}
            className="border border-border bg-surface-2 px-3 py-1 font-mono text-xs text-text hover:bg-page-bg"
            style={{ fontFamily: "var(--font-mono-chat)" }}
          >
            + add question
          </button>
        </div>
      </Section>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy}
          className="border-2 border-border bg-accent px-6 py-2 font-mono text-sm text-accent-contrast enabled:hover:bg-accent-hover disabled:opacity-50"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          {busy ? "saving..." : "save all changes"}
        </button>
        {statusMsg && (
          <span className="font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
            {statusMsg}
          </span>
        )}
      </div>
    </div>
  );
}
