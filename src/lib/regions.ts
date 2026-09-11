import type { Concept } from "./types";

export interface Region {
  slug: string;
  concept: Concept;
  name: string;
  emoji: string;
  blurb: string;
  color: "challenge" | "think" | "explore";
}

export const REGIONS: Region[] = [
  {
    slug: "bakery",
    concept: "equal_groups",
    name: "Dragon Bakery",
    emoji: "🍪",
    blurb: "The dragons' cookies aren't shared fairly.",
    color: "challenge",
  },
  {
    slug: "cafe",
    concept: "equal_partition",
    name: "Fraction Café",
    emoji: "🍫",
    blurb: "The chef keeps cutting pieces that don't match.",
    color: "think",
  },
  {
    slug: "railway",
    concept: "skip_count",
    name: "Number Railway",
    emoji: "🚂",
    blurb: "A train won't start — one car has the wrong number.",
    color: "explore",
  },
];

export function regionBySlug(slug: string): Region | undefined {
  return REGIONS.find((r) => r.slug === slug);
}

export function regionByConcept(concept: Concept): Region {
  return REGIONS.find((r) => r.concept === concept)!;
}
