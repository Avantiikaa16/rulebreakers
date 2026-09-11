// RuleBreakers domain types.
// The deterministic engine owns pedagogy: it renders worlds, checks fixes, and
// tracks the child's evolving hypothesis. The LLM only reads the child's words
// and picks which authored counterexample to show next.

export type Concept = "equal_groups" | "equal_partition" | "skip_count";

/**
 * A facet is one thing a *complete* understanding of a concept includes.
 * Counterexamples are chosen to expose a facet the child's hypothesis is missing.
 */
export type Facet =
  // equal_groups
  | "equality" // every group has the same amount
  | "exhaustiveness" // all the items get used, none left over
  | "count_independence" // the per-group amount is total ÷ groups, not a fixed number
  // equal_partition
  | "equal_size" // the parts are the same size
  | "part_count" // there are as many parts as the denominator says
  | "covers_whole" // the parts together make the whole, no gap or overlap
  // skip_count
  | "constant_step" // the jump between terms never changes
  | "step_value" // knowing which step it is (2s, 5s, 10s)
  | "extends"; // the rule keeps going past the given terms

export type MasteryState = "exploring" | "hypothesizing" | "testing" | "generalized";

// ---------- World state (what gets rendered and manipulated) ----------

export interface GroupsWorld {
  kind: "groups";
  characters: string[]; // display names, one per group
  characterGlyph: string; // 🐉
  itemGlyph: string; // 🍪
  groups: number[]; // items in front of each character
  leftover: number; // items still on the counter
  storyItem: string; // "cookies"
  storyGroup: string; // "dragons"
}

export interface PartitionWorld {
  kind: "partition";
  glyph: string; // 🍫 / 🍕
  whole: string; // "chocolate bar"
  /** cut positions in (0, end), sorted; slices = gaps between 0, …cuts, end */
  cuts: number[];
  /** how far along the whole the chef actually worked — should be 1 */
  end: number;
  target: { numerator: number; denominator: number };
  story: string;
}

export interface SequenceWorld {
  kind: "sequence";
  /** the cars; a null slot is a missing car the child must fill */
  terms: (number | null)[];
  step: number; // the intended constant step
  /** value choices offered when a car is tapped */
  choices: number[];
  story: string;
  vehicle: string; // "train"
}

export type WorldState = GroupsWorld | PartitionWorld | SequenceWorld;

// ---------- Hypothesis pipeline ----------

export interface HypothesisAnalysis {
  raw: string;
  concept: Concept;
  covers: Facet[];
  missing: Facet[];
  mentionsSpecificNumber: boolean;
  childSafeParaphrase: string;
  confidence: number;
}

export interface HypothesisModel {
  concept: Concept;
  covered: Facet[];
  statements: string[]; // every explanation the child has given, in order
}

export interface WorldOutcomeSnapshot {
  templateId: string;
  exposedFacet: Facet | null;
  passed: boolean;
  isTrick: boolean;
}

/** Captured when a child generalises a concept — feeds the Tutor Handoff Report. */
export interface SessionSummary {
  at: string;
  concept: Concept;
  statements: string[];
  facetsCovered: Facet[];
  worldsFixed: number;
  outcomes: WorldOutcomeSnapshot[];
  beatTrick: boolean;
  masteryState: MasteryState;
}

export type AnalyticsEvent =
  | "world_entered"
  | "fault_found"
  | "world_fixed"
  | "false_fix"
  | "nudge_shown"
  | "hypothesis_given"
  | "hypothesis_classified"
  | "rule_upgraded"
  | "counterexample_served"
  | "trick_passed"
  | "trick_failed"
  | "concept_generalized";
