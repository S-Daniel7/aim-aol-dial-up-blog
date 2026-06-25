import { createPublicClient } from "@/lib/supabase/public";
import { ScreennameGenerator } from "@/components/ScreennameGenerator";
import type { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About",
  description: "about me :)",
};

type QA = { q: string; a: string };
type Interests = Record<string, string[]>;

type SiteAbout = {
  avatar_emoji: string;
  screen_name: string;
  member_since: string;
  location: string;
  age: string;
  status: string;
  bio: string;
  interests: Interests;
  fun_facts: string[];
  get_to_know_me: QA[];
};

const DEFAULTS: SiteAbout = {
  avatar_emoji: "🌙",
  screen_name: "soapie",
  member_since: "2026",
  location: "somewhere online",
  age: "20s",
  status: "away (probably)",
  bio: `i'm a person on the internet who likes making things and collecting memories. this site is my little archive — a place to keep the conversations, thoughts, and moments i don't want to forget.

i grew up online in the AIM era, and i think some part of me never left. there's something about the old internet — small, personal, weird — that i'm trying to hold onto here.

by day i do various things. by night i'm usually reading, watching something, or falling down a rabbit hole i'll tell you about later.`,
  interests: {
    music: ["indie rock", "shoegaze", "early 2000s pop", "mitski", "mazzy star"],
    movies: ["lost in translation", "eternal sunshine", "amélie", "ghost world"],
    books: ["the bell jar", "norwegian wood", "a little life", "piranesi"],
    games: ["animal crossing", "stardew valley", "the sims 2", "journey"],
    other: ["film photography", "thrift shopping", "late night walks", "collecting cds"],
  },
  fun_facts: [
    "i can type ~90 wpm",
    "i have never seen a single star wars movie",
    "i keep a physical journal and have since i was 12",
    "my go-to karaoke song is 'total eclipse of the heart'",
    "i know the words to every fall out boy album from 2003–2008",
    "i still have my old tamagotchi",
  ],
  get_to_know_me: [
    { q: "what's your sign?", a: "☿ gemini sun, pisces moon" },
    { q: "introvert or extrovert?", a: "introvert with extrovert tendencies (i crash after)" },
    { q: "coffee or tea?", a: "iced coffee at all hours, even midnight" },
    { q: "early bird or night owl?", a: "night owl. i do my best thinking at 2am" },
    { q: "if you could live anywhere?", a: "a small apartment above a bookshop in tokyo or edinburgh" },
  ],
};

async function fetchAbout(): Promise<SiteAbout> {
  const supabase = createPublicClient();
  if (!supabase) return DEFAULTS;
  const { data } = await supabase.from("site_about").select("*").maybeSingle();
  if (!data) return DEFAULTS;
  return {
    avatar_emoji: data.avatar_emoji || DEFAULTS.avatar_emoji,
    screen_name: data.screen_name || DEFAULTS.screen_name,
    member_since: data.member_since || DEFAULTS.member_since,
    location: data.location || DEFAULTS.location,
    age: data.age || DEFAULTS.age,
    status: data.status || DEFAULTS.status,
    bio: data.bio || DEFAULTS.bio,
    interests: (data.interests as Interests) ?? DEFAULTS.interests,
    fun_facts: (data.fun_facts as string[]) ?? DEFAULTS.fun_facts,
    get_to_know_me: (data.get_to_know_me as QA[]) ?? DEFAULTS.get_to_know_me,
  };
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
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

export default async function AboutPage() {
  const about = await fetchAbout();

  const bioParagraphs = about.bio.split(/\n\n+/).filter(Boolean);
  const interestCategories = Object.entries(about.interests).filter(([, items]) => items.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="mb-1 font-heading text-3xl tracking-wide text-accent"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          ~* about me *~
        </h1>
        <p className="font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
          hi, welcome to my corner of the web :)
        </p>
      </div>

      {/* Profile card + bio */}
      <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
        {/* Avatar + stats */}
        <div
          className="border-2 border-border bg-surface sm:w-52"
          style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
        >
          <div
            className="flex items-center gap-2 border-b-2 border-border bg-title-bar px-3 py-2"
          >
            <span className="online-dot" />
            <span className="font-heading text-sm text-title-bar-text" style={{ fontFamily: "var(--font-heading)" }}>
              {about.screen_name}
            </span>
          </div>

          <div className="aspect-square w-full border-b border-border bg-surface-2 flex items-center justify-center">
            <span className="text-5xl select-none">{about.avatar_emoji}</span>
          </div>

          <div className="divide-y divide-border">
            {[
              ["screen name", about.screen_name],
              ["member since", about.member_since],
              ["location", about.location],
              ["age", about.age],
              ["status", about.status],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} className="flex flex-col px-3 py-1.5">
                <span
                  className="font-mono text-[9px] uppercase tracking-widest text-muted"
                  style={{ fontFamily: "var(--font-mono-chat)" }}
                >
                  {label}
                </span>
                <span className="font-mono text-xs text-text" style={{ fontFamily: "var(--font-mono-chat)" }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bio */}
        <Card title={`hi, i'm ${about.screen_name} ♡`}>
          <div className="space-y-3 text-sm text-text leading-relaxed">
            {bioParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p
              className="border-t border-border pt-3 font-mono text-xs text-muted"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >
              feel free to sign my guestbook or ask me something in the ask box —
              i genuinely love hearing from people who find their way here ♡
            </p>
          </div>
        </Card>
      </div>

      {/* Interests */}
      {interestCategories.length > 0 && (
        <Card title="interests ✦">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {interestCategories.map(([category, items]) => (
              <div key={category}>
                <p
                  className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-accent"
                  style={{ fontFamily: "var(--font-mono-chat)" }}
                >
                  {category}
                </p>
                <ul className="space-y-0.5">
                  {items.map((item) => (
                    <li
                      key={item}
                      className="font-mono text-xs text-text before:mr-1.5 before:text-muted before:content-['›']"
                      style={{ fontFamily: "var(--font-mono-chat)" }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Get to know me */}
      {about.get_to_know_me.length > 0 && (
        <Card title="get to know me ~">
          <div className="space-y-3">
            {about.get_to_know_me.map(({ q, a }) => (
              <div key={q} className="border-b border-border pb-3 last:border-0 last:pb-0">
                <p
                  className="font-mono text-[10px] uppercase tracking-widest text-muted mb-0.5"
                  style={{ fontFamily: "var(--font-mono-chat)" }}
                >
                  {q}
                </p>
                <p className="text-sm text-text leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Fun facts */}
      {about.fun_facts.length > 0 && (
        <Card title="random facts ★">
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {about.fun_facts.map((fact, i) => (
              <li
                key={i}
                className="animate-slide-in font-mono text-xs text-text leading-relaxed before:mr-2 before:text-accent before:content-['✦']"
                style={{
                  fontFamily: "var(--font-mono-chat)",
                  animationDelay: `${i * 0.06}s`,
                }}
              >
                {fact}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Screenname generator */}
      <ScreennameGenerator />

      {/* Find me */}
      <Card title="find me ~*">
        <p
          className="mb-3 font-mono text-xs text-muted"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          ways to reach me / places i exist online
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "✉ ask box", href: "/ask" },
            { label: "📖 guestbook", href: "/guestbook" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="card-lift btn-press border-2 border-border bg-surface-2 px-3 py-1.5 font-mono text-xs text-text no-underline hover:text-accent"
              style={{
                fontFamily: "var(--font-mono-chat)",
                boxShadow: "2px 2px 0 0 var(--border)",
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
