"use client";

// Oops Island progress — which regions the child has cracked. localStorage only.

import type { Concept } from "./types";

const KEY = "rulebreakers:progress:v1";
export const REGION_ORDER: Concept[] = ["equal_groups", "equal_partition", "skip_count"];

const listeners = new Set<() => void>();
let cache: Set<Concept> | null = null;
let arrCache: Concept[] = [];

function load(): Set<Concept> {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
    return new Set(raw.filter((c): c is Concept => REGION_ORDER.includes(c as Concept)));
  } catch {
    return new Set();
  }
}

function snapshot(): Set<Concept> {
  if (!cache) {
    cache = load();
    arrCache = [...cache];
  }
  return cache;
}

function commit(next: Set<Concept>): void {
  cache = next;
  arrCache = [...next];
  try {
    localStorage.setItem(KEY, JSON.stringify([...next]));
  } catch {
    /* ignore */
  }
  for (const l of listeners) l();
}

export function completedRegions(): Concept[] {
  snapshot();
  return arrCache;
}

export function isRegionDone(c: Concept): boolean {
  return snapshot().has(c);
}

/** the boss unlocks once all three regions are done */
export function bossUnlocked(): boolean {
  return REGION_ORDER.every((c) => snapshot().has(c));
}

export function completeRegion(c: Concept): void {
  const next = new Set(snapshot());
  next.add(c);
  commit(next);
}

export function resetProgress(): void {
  commit(new Set());
}

export function subscribeProgress(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
