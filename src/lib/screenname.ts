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

export function generateScreenname(): string {
  const adj = pick(ADJECTIVES);
  const noun = pick(NOUNS);
  const sep = pick(SEPARATORS);
  const suffix = pick(SUFFIXES);
  const prefix = pick(PREFIXES);
  const wrap = pick(WRAPPERS);
  const core = `${prefix}${adj}${sep}${noun}${suffix}`;
  return wrap(core);
}
