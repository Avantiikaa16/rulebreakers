// Number Railway — the skip_count world.
// A train of cars. One car is wrong, or the last car is missing.

import type { SequenceWorld, WorldState } from "@/lib/types";
import { int, mulberry32, type WorldTemplate } from "./template";

export function sequenceFixed(w: SequenceWorld): boolean {
  if (w.terms.some((t) => t === null)) return false;
  const t = w.terms as number[];
  for (let i = 1; i < t.length; i++) {
    if (t[i] - t[i - 1] !== w.step) return false;
  }
  return true;
}

function correctTerms(start: number, step: number, len: number): number[] {
  return Array.from({ length: len }, (_, i) => start + i * step);
}

function choicesFor(terms: (number | null)[], step: number): number[] {
  const present = terms.filter((t): t is number => t !== null);
  const set = new Set<number>(present);
  // add the intended value at every slot
  const start = present[0] ?? step;
  correctTerms(start, step, terms.length).forEach((v) => set.add(v));
  // a couple of near distractors
  set.add(start + terms.length * step);
  set.add((present[present.length - 1] ?? 0) + 1);
  return [...set].filter((v) => v >= 0).sort((a, b) => a - b);
}

function base(terms: (number | null)[], step: number, story: string): SequenceWorld {
  return {
    kind: "sequence",
    terms,
    step,
    choices: choicesFor(terms, step),
    story,
    vehicle: "train",
  };
}

const asS = (w: WorldState) => w as SequenceWorld;

export const SEQUENCE_TEMPLATES: WorldTemplate[] = [
  {
    id: "wrong-car",
    concept: "skip_count",
    exposesFacet: "constant_step",
    name: "One car is out of step",
    build: (seed) => {
      const r = mulberry32(seed);
      const step = 2;
      const start = int(r, 1, 3);
      const t = correctTerms(start, step, 5);
      const bad = int(r, 2, 3);
      t[bad] += 1; // breaks the constant jump
      return base(t, step, "The conductor's train won't start. One car has the wrong number.");
    },
    isFixed: (w) => sequenceFixed(asS(w)),
    goal: "Every jump between cars has to be the same size.",
    nudges: [
      "The conductor says the train won't move…",
      "Check the jump between each pair of cars. One jump is different.",
      "Find the odd car and change it so all the jumps match.",
    ],
  },
  {
    id: "wrong-step-car",
    concept: "skip_count",
    exposesFacet: "step_value",
    name: "Which step is it?",
    build: (seed) => {
      const r = mulberry32(seed);
      const step = r() < 0.5 ? 5 : 10;
      const start = step;
      const t = correctTerms(start, step, 5);
      const bad = int(r, 1, 3);
      t[bad] = t[bad] - Math.ceil(step / 2); // off by a non-step amount
      return base(t, step, "This train counts by a special number. One car forgot which.");
    },
    isFixed: (w) => sequenceFixed(asS(w)),
    goal: "Work out the jump (2s? 5s? 10s?) and make the odd car fit.",
    nudges: [
      "What is this train counting by?",
      "Most jumps are the same — name that number.",
      "One car doesn't fit the jump. Fix it to match.",
    ],
  },
  {
    id: "missing-end",
    concept: "skip_count",
    exposesFacet: "extends",
    name: "The last car is missing",
    build: (seed) => {
      const r = mulberry32(seed);
      const step = r() < 0.5 ? 2 : 5;
      const start = step;
      const t: (number | null)[] = correctTerms(start, step, 5);
      t[4] = null;
      return base(t, step, "The engine needs one more car — but which number goes there?");
    },
    isFixed: (w) => sequenceFixed(asS(w)),
    goal: "The pattern keeps going the same way. What comes next?",
    nudges: [
      "There's an empty spot at the end of the train.",
      "The jumps don't stop. Keep the same jump going.",
      "Add the car that continues the pattern.",
    ],
  },
  {
    id: "nothing-wrong",
    concept: "skip_count",
    exposesFacet: null,
    name: "The train is already fine",
    build: (seed) => {
      const r = mulberry32(seed);
      const step = [2, 5, 10][int(r, 0, 2)];
      return base(correctTerms(step, step, 5), step, "The villain says this train is broken. Is it?");
    },
    isFixed: (w) => sequenceFixed(asS(w)),
    goal: "If every jump is equal, the train is already good — don't get tricked.",
    nudges: [
      "The villain is certain this one is broken…",
      "Check every jump between the cars.",
      "All the jumps match — this train is fine!",
    ],
  },
];
