// Fraction Café — the equal_partition world.
// The whole bar is 12 ticks. `cuts` are tick positions (1..11). `end` is the
// tick the chef stopped at — should be 12. Discrete so the interaction is a tap.

import type { PartitionWorld, WorldState } from "@/lib/types";
import { int, mulberry32, type WorldTemplate } from "./template";

export const TICKS = 12;

export function sliceWidths(w: PartitionWorld): number[] {
  const inside = [...w.cuts].filter((c) => c > 0 && c < w.end).sort((a, b) => a - b);
  const pts = [0, ...inside, w.end];
  const out: number[] = [];
  for (let i = 1; i < pts.length; i++) out.push(pts[i] - pts[i - 1]);
  return out;
}

export function partitionFixed(w: PartitionWorld): boolean {
  const d = w.target.denominator;
  if (w.end !== TICKS) return false;
  const inside = w.cuts.filter((c) => c > 0 && c < TICKS);
  if (inside.length !== d - 1) return false;
  const widths = sliceWidths(w);
  return widths.every((x) => x === TICKS / d);
}

function base(over: Partial<PartitionWorld>): PartitionWorld {
  return {
    kind: "partition",
    glyph: "🍫",
    whole: "chocolate bar",
    cuts: [],
    end: TICKS,
    target: { numerator: 1, denominator: 2 },
    story: "",
    ...over,
  };
}

const asP = (w: WorldState) => w as PartitionWorld;

export const PARTITION_TEMPLATES: WorldTemplate[] = [
  {
    id: "unequal-parts",
    concept: "equal_partition",
    exposesFacet: "equal_size",
    name: "Pieces aren't equal",
    build: (seed) => {
      const r = mulberry32(seed);
      return base({
        cuts: [r() < 0.5 ? 4 : 8], // should be 6
        target: { numerator: 1, denominator: 2 },
        story: "A customer ordered HALF the bar. The chef cut it — but not down the middle.",
      });
    },
    isFixed: (w) => partitionFixed(asP(w)),
    goal: "Both pieces have to be exactly the same size.",
    nudges: [
      "The chef says “I cut it in half!” … did they?",
      "Look at the two pieces. One is bigger.",
      "Move the cut to the middle so both halves match.",
    ],
  },
  {
    id: "wrong-count",
    concept: "equal_partition",
    exposesFacet: "part_count",
    name: "Wrong number of pieces",
    build: (seed) => {
      const r = mulberry32(seed);
      const d = int(r, 3, 4);
      return base({
        cuts: [6], // only 2 pieces
        target: { numerator: 1, denominator: d },
        story: `The order is for ONE ${d === 3 ? "third" : "quarter"} of the bar. The chef only cut it in two.`,
      });
    },
    isFixed: (w) => partitionFixed(asP(w)),
    goal: "The bottom number tells you how many equal pieces to make.",
    nudges: [
      "How many pieces does the order need?",
      "Count the pieces. It's not enough.",
      "Add cuts until there are the right number of equal pieces.",
    ],
  },
  {
    id: "short-bar",
    concept: "equal_partition",
    exposesFacet: "covers_whole",
    name: "Pieces don't cover the whole",
    build: (seed) => {
      const r = mulberry32(seed);
      return base({
        cuts: [r() < 0.5 ? 3 : 4],
        end: int(r, 7, 9),
        target: { numerator: 1, denominator: 2 },
        story: "The chef made two equal pieces… then stopped. Part of the bar is untouched.",
      });
    },
    isFixed: (w) => partitionFixed(asP(w)),
    goal: "The pieces together have to make up the WHOLE bar.",
    nudges: [
      "The pieces look equal, but the chef isn't finished.",
      "Look at the right end. Part of the bar isn't shared.",
      "Make the bar reach the end, then split it into equal pieces.",
    ],
  },
  {
    id: "nothing-wrong",
    concept: "equal_partition",
    exposesFacet: null,
    name: "The cut is already fair",
    build: (seed) => {
      const r = mulberry32(seed);
      const d = [2, 3, 4][int(r, 0, 2)];
      const cuts = Array.from({ length: d - 1 }, (_, i) => ((i + 1) * TICKS) / d);
      return base({ cuts, target: { numerator: 1, denominator: d }, story: "The villain says the chef messed up this order. Did they?" });
    },
    isFixed: (w) => partitionFixed(asP(w)),
    goal: "If the pieces are equal and cover the whole bar, it's already right.",
    nudges: [
      "The villain is very sure something is wrong here…",
      "Measure each piece. Check the far end.",
      "Equal pieces, whole bar covered — the chef got it right!",
    ],
  },
];
