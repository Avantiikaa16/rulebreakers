"use client";

// The child's chosen nickname + avatar — purely cosmetic, purely local.
// Never sent to any API (see analyze-hypothesis / tutor-report routes): it only
// personalises what's shown on-screen (island greeting, tutor report byline).

const KEY = "rulebreakers:player:v1";

export interface Player {
  name: string;
  avatar: string;
}

export const AVATARS = ["🦊", "🐙", "🐸", "🦖", "🐼", "🚀", "🦄", "🐳"] as const;

const listeners = new Set<() => void>();
let cache: Player | null | undefined; // undefined = not read from localStorage yet

function load(): Player | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Player>;
    if (typeof parsed.name === "string" && parsed.name.trim()) {
      return {
        name: parsed.name.trim().slice(0, 24),
        avatar: typeof parsed.avatar === "string" && parsed.avatar ? parsed.avatar : AVATARS[0],
      };
    }
    return null;
  } catch {
    return null;
  }
}

function snapshot(): Player | null {
  if (cache === undefined) cache = load();
  return cache;
}

export function getPlayer(): Player | null {
  return snapshot();
}

export function setPlayer(name: string, avatar: string): void {
  const trimmed = name.trim().slice(0, 24);
  if (!trimmed) return;
  const next: Player = { name: trimmed, avatar };
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  for (const l of listeners) l();
}

export function clearPlayer(): void {
  cache = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  for (const l of listeners) l();
}

export function subscribePlayer(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
