const STORAGE_KEY = "aim-sounds";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try { ctx = new AudioContext(); } catch { return null; }
  }
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  return ctx;
}

export function soundsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "1";
}

export function setSoundsEnabled(on: boolean): void {
  localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
}

export function playDoorOpen(): void {
  if (!soundsEnabled()) return;
  const c = getCtx();
  if (!c) return;
  // Two ascending chime notes — the classic AIM "someone signed on"
  [523.25, 659.25].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = c.currentTime + i * 0.18;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc.start(t);
    osc.stop(t + 0.45);
  });
}

export function playDoorClose(): void {
  if (!soundsEnabled()) return;
  const c = getCtx();
  if (!c) return;
  // Two descending notes — "someone signed off"
  [659.25, 523.25].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = c.currentTime + i * 0.14;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
    osc.start(t);
    osc.stop(t + 0.38);
  });
}

export function playTick(): void {
  if (!soundsEnabled()) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = "sine";
  osc.frequency.value = 1400;
  gain.gain.setValueAtTime(0.04, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.04);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + 0.04);
}

export function playDing(): void {
  if (!soundsEnabled()) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(660, c.currentTime + 0.15);
  gain.gain.setValueAtTime(0.25, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.6);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + 0.6);
}
