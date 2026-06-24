"use client";

import { useState } from "react";

const PREFIXES = ["x", "xx", "xX", "i", "ur", "sk8", ""];
const SUFFIXES = ["99", "2003", "2004", "2k4", "4ever", "xo", "irl", "lol", "omg", "143", ""];
const WRAPPERS = [
  (s: string) => `xX${s}Xx`,
  (s: string) => `~${s}~`,
  (s: string) => `-${s}-`,
  (s: string) => s,
  (s: string) => s,
  (s: string) => s,
];
const ADJECTIVES = [
  "midnight", "sunset", "golden", "cosmic", "electric", "velvet", "crystal",
  "shadow", "silver", "purple", "neon", "scene", "emo", "sweet", "hot",
  "cute", "sk8", "fallen", "broken", "hopeless", "tragic", "dreamy",
  "sleepy", "lonely", "glitter", "rainbow", "black", "dark", "bright",
];
const NOUNS = [
  "star", "angel", "raven", "wolf", "pixie", "grl", "boi", "dreamer",
  "rocker", "princess", "ninja", "panda", "kitten", "dragon", "butterfly",
  "heart", "soul", "rose", "flame", "tear", "smile", "rebel", "ghost",
];
const SEPARATORS = ["_", "", ".", "-", ""];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generate(): string {
  const adj = pick(ADJECTIVES);
  const noun = pick(NOUNS);
  const sep = pick(SEPARATORS);
  const suffix = pick(SUFFIXES);
  const prefix = pick(PREFIXES);
  const wrap = pick(WRAPPERS);
  const core = `${prefix}${adj}${sep}${noun}${suffix}`;
  return wrap(core);
}

export function ScreennameGenerator() {
  const [name, setName] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  function roll() {
    const next = generate();
    setName(next);
    setHistory((prev) => [next, ...prev].slice(0, 5));
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
        AIM screenname generator ✦
      </div>
      <div className="p-4 space-y-4">
        <p className="font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
          what would your 2003 screenname have been?
        </p>

        {name && (
          <div className="border-2 border-border bg-page-bg px-4 py-3 text-center">
            <p
              className="font-mono text-lg text-accent break-all"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >
              {name}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={roll}
          className="btn-press border-2 border-border bg-accent px-5 py-2 font-heading text-lg text-accent-contrast hover:bg-accent-hover"
          style={{ fontFamily: "var(--font-heading)", boxShadow: "2px 2px 0 0 var(--border)" }}
        >
          {name ? "[ try again ]" : "[ generate! ]"}
        </button>

        {history.length > 1 && (
          <div>
            <p
              className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted"
              style={{ fontFamily: "var(--font-mono-chat)" }}
            >
              recent rolls
            </p>
            <ul className="space-y-0.5">
              {history.slice(1).map((h, i) => (
                <li
                  key={i}
                  className="font-mono text-xs text-muted before:mr-2 before:content-['›']"
                  style={{ fontFamily: "var(--font-mono-chat)" }}
                >
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
