// Dragon Bakery — the equal_groups world.
// Each template isolates ONE facet of fair sharing.

import type { GroupsWorld, WorldState } from "@/lib/types";
import { int, mulberry32, type WorldTemplate } from "./template";

export function allEqual(groups: number[]): boolean {
  return groups.length > 0 && groups.every((g) => g === groups[0]);
}

export function groupsTotal(w: GroupsWorld): number {
  return w.groups.reduce((a, b) => a + b, 0) + w.leftover;
}

const DRAGONS = ["Ember", "Cinder", "Blaze", "Sparky", "Pip"];

function base(groups: number[], leftover: number): GroupsWorld {
  return {
    kind: "groups",
    characters: DRAGONS.slice(0, groups.length),
    characterGlyph: "🐉",
    itemGlyph: "🍪",
    groups,
    leftover,
    storyItem: "cookies",
    storyGroup: "dragons",
  };
}

const asGroups = (w: WorldState) => w as GroupsWorld;

export const GROUPS_TEMPLATES: WorldTemplate[] = [
  {
    id: "unequal",
    concept: "equal_groups",
    exposesFacet: "equality",
    name: "Shared unevenly",
    build: (seed) => {
      const r = mulberry32(seed);
      const n = int(r, 3, 4);
      const spread = int(r, 1, 2);
      return base([n - spread, n, n + spread], 0);
    },
    isFixed: (w) => allEqual(asGroups(w).groups) && asGroups(w).leftover === 0,
    goal: "Every dragon needs the same number of cookies.",
    nudges: [
      "The baker says something looks unfair…",
      "Count what each dragon has. Are they the same?",
      "One dragon has more than the others. Move cookies until they match.",
    ],
  },
  {
    id: "leftover",
    concept: "equal_groups",
    exposesFacet: "exhaustiveness",
    name: "Cookies left on the counter",
    build: (seed) => {
      const r = mulberry32(seed);
      const n = int(r, 2, 3);
      return base([n, n, n], 3); // exactly one extra each
    },
    isFixed: (w) => asGroups(w).leftover === 0 && allEqual(asGroups(w).groups),
    goal: "Share ALL the cookies — none left on the counter.",
    nudges: [
      "Everyone has the same… but the baker still looks worried.",
      "Look at the counter. Something is still sitting there.",
      "There are extra cookies. Give them out so every dragon stays equal.",
    ],
  },
  {
    id: "different-total",
    concept: "equal_groups",
    exposesFacet: "count_independence",
    name: "A different number of cookies",
    build: (seed) => {
      const r = mulberry32(seed);
      const n = int(r, 5, 6);
      const spread = int(r, 2, 3);
      return base([n - spread, n, n + spread], 0);
    },
    isFixed: (w) => allEqual(asGroups(w).groups) && asGroups(w).leftover === 0,
    goal: "Make them equal — even though it's a different amount now.",
    nudges: [
      "New batch, bigger this time. Is the sharing fair?",
      "The number is different from before. Count carefully.",
      "The fair amount changed because the total changed. Even it out.",
    ],
  },
  {
    id: "nothing-wrong",
    concept: "equal_groups",
    exposesFacet: null,
    name: "Nothing is actually broken",
    build: (seed) => {
      const r = mulberry32(seed);
      const n = int(r, 3, 5);
      return base([n, n, n], 0);
    },
    isFixed: (w) => allEqual(asGroups(w).groups) && asGroups(w).leftover === 0,
    goal: "Check carefully. If it's already fair, say so — don't get tricked.",
    nudges: [
      "The villain claims something is broken here…",
      "Count each dragon. Check the counter.",
      "Everything is equal and nothing is left. It's already fair!",
    ],
  },
];
