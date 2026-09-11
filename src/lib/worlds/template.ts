// One shape for every world, whatever the concept.

import type { Concept, Facet, WorldState } from "@/lib/types";

export interface WorldTemplate {
  id: string;
  concept: Concept;
  /** the facet a correct fix proves the child holds; null = the "nothing is wrong" trick */
  exposesFacet: Facet | null;
  name: string;
  build: (seed: number) => WorldState;
  isFixed: (w: WorldState) => boolean;
  /** what the child is really being asked to notice */
  goal: string;
  /** escalating help, one line at a time on a timer */
  nudges: string[];
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const int = (r: () => number, lo: number, hi: number) =>
  lo + Math.floor(r() * (hi - lo + 1));
