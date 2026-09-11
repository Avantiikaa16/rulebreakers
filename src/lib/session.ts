"use client";

import type { Concept, SessionSummary } from "./types";

const KEY = "rulebreakers:sessions";

type Store = Partial<Record<Concept, SessionSummary>>;

function read(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Store;
  } catch {
    return {};
  }
}

export function saveSession(s: SessionSummary): void {
  try {
    const all = read();
    all[s.concept] = s;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function loadSessions(): SessionSummary[] {
  return Object.values(read()).filter(Boolean) as SessionSummary[];
}

export function loadSession(concept: Concept): SessionSummary | null {
  return read()[concept] ?? null;
}
