"use client";

// Tiny original UI sound synth — no audio assets, generated live with WebAudio.
// Every cue is a short oscillator envelope. Muteable; preference persists per device.

export type Cue =
  | "scan"
  | "mission"
  | "thinking"
  | "ruleFormed"
  | "repair"
  | "star"
  | "core"
  | "error"
  | "alarm"
  | "boop";

const STORAGE_KEY = "rulebreakers:muted";

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    ctx ??= new (window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    return ctx;
  } catch {
    return null;
  }
}

export function isMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
  } catch {
    /* ignore */
  }
}

interface Tone {
  freq: number;
  start: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
}

const CUES: Record<Cue, Tone[]> = {
  scan: [
    { freq: 520, start: 0, dur: 0.08 },
    { freq: 780, start: 0.08, dur: 0.12 },
  ],
  mission: [
    { freq: 330, start: 0, dur: 0.12 },
    { freq: 494, start: 0.1, dur: 0.14 },
    { freq: 659, start: 0.22, dur: 0.22 },
  ],
  thinking: [{ freq: 440, start: 0, dur: 0.09, type: "sine", gain: 0.15 }],
  ruleFormed: [
    { freq: 587, start: 0, dur: 0.1 },
    { freq: 880, start: 0.1, dur: 0.16 },
  ],
  repair: [
    { freq: 392, start: 0, dur: 0.09 },
    { freq: 523, start: 0.09, dur: 0.09 },
    { freq: 784, start: 0.18, dur: 0.24 },
  ],
  star: [
    { freq: 784, start: 0, dur: 0.08 },
    { freq: 1046, start: 0.08, dur: 0.18 },
  ],
  core: [
    { freq: 392, start: 0, dur: 0.14 },
    { freq: 587, start: 0.12, dur: 0.14 },
    { freq: 784, start: 0.24, dur: 0.16 },
    { freq: 1175, start: 0.38, dur: 0.4 },
  ],
  error: [
    { freq: 300, start: 0, dur: 0.12, type: "triangle" },
    { freq: 220, start: 0.1, dur: 0.18, type: "triangle" },
  ],
  alarm: [
    { freq: 880, start: 0, dur: 0.13, type: "square", gain: 0.1 },
    { freq: 620, start: 0.16, dur: 0.13, type: "square", gain: 0.1 },
    { freq: 880, start: 0.32, dur: 0.13, type: "square", gain: 0.1 },
    { freq: 620, start: 0.48, dur: 0.16, type: "square", gain: 0.1 },
  ],
  boop: [{ freq: 660, start: 0, dur: 0.06, type: "sine", gain: 0.12 }],
};

export function playCue(cue: Cue): void {
  if (isMuted()) return;
  const ac = audio();
  if (!ac) return;
  if (ac.state === "suspended") void ac.resume();
  const now = ac.currentTime;
  for (const t of CUES[cue]) {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = t.type ?? "sine";
    osc.frequency.value = t.freq;
    const peak = t.gain ?? 0.2;
    g.gain.setValueAtTime(0.0001, now + t.start);
    g.gain.exponentialRampToValueAtTime(peak, now + t.start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + t.start + t.dur);
    osc.connect(g).connect(ac.destination);
    osc.start(now + t.start);
    osc.stop(now + t.start + t.dur + 0.02);
  }
}
