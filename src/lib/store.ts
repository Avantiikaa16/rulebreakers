"use client";

// RuleBreakers game loop:  notice → fix → explain → mutate → generalize
// The deterministic engine owns every pedagogical decision (which world,
// is it fixed, has the child generalised). The LLM only reads the child's words.

import { create } from "zustand";
import type {
  Concept,
  Facet,
  HypothesisAnalysis,
  HypothesisModel,
  MasteryState,
  PartitionWorld,
  SequenceWorld,
  WorldState,
} from "./types";
import { firstTemplateId, templateById } from "./worlds/registry";
import { selectTemplate } from "./hypothesis/select";
import { classifyHypothesisLocal } from "./hypothesis/classify-local";
import { emptyModel, mergeHypothesis } from "./hypothesis/model";
import { deriveMastery, type WorldOutcome } from "./mastery";
import { allFacets } from "./concepts";
import { saveSession } from "./session";
import { completeRegion } from "./progress";
import { track } from "./analytics";

export type Phase = "intro" | "notice" | "fix" | "fixed" | "explain" | "mutate" | "generalized";
export type FixClaim = "fixed" | "nothing";

export interface FeedbackNote {
  tone: "info" | "nudge" | "cheer";
  text: string;
}

interface GameData {
  concept: Concept;
  phase: Phase;

  world: WorldState;
  templateId: string;
  seenTemplateIds: string[];
  worldsFixed: number;
  nudgeIndex: number;

  model: HypothesisModel;
  lastAnalysis: HypothesisAnalysis | null;
  analysisSource: "llm" | "fallback" | null;
  analyzing: boolean;
  gained: Facet[];
  ruleUpgraded: boolean;

  outcomes: WorldOutcome[];
  masteryState: MasteryState;

  feedback: FeedbackNote | null;
}

interface State extends GameData {
  start: (concept: Concept, seed?: number) => void;
  beginFirstWorld: () => void;
  seeIt: () => void;
  moveCookie: (from: number | "counter", to: number | "counter") => void;
  setPartition: (patch: Partial<Pick<PartitionWorld, "cuts" | "end">>) => void;
  setCar: (index: number, value: number) => void;
  bumpNudge: () => void;
  checkFix: (claim: FixClaim) => void;
  toExplain: () => void;
  submitHypothesis: (text: string, analysis?: HypothesisAnalysis) => void;
  analyzeAndSubmit: (text: string) => Promise<void>;
  nextWorld: () => void;
  clearFeedback: () => void;
  reset: () => void;
}

function freshSeed(): number {
  return (Date.now() & 0xffff) || 7;
}

let seedCounter = 1;

function initial(concept: Concept, seed: number): GameData {
  const id = firstTemplateId(concept);
  return {
    concept,
    phase: "intro",
    world: templateById(concept, id).build(seed),
    templateId: id,
    seenTemplateIds: [],
    worldsFixed: 0,
    nudgeIndex: 0,
    model: emptyModel(concept),
    lastAnalysis: null,
    analysisSource: null,
    analyzing: false,
    gained: [],
    ruleUpgraded: false,
    outcomes: [],
    masteryState: "exploring",
    feedback: null,
  };
}

function syntheticAnalysis(model: HypothesisModel, last: HypothesisAnalysis | null): HypothesisAnalysis {
  const covers = model.covered;
  return {
    raw: last?.raw ?? "",
    concept: model.concept,
    covers,
    missing: allFacets(model.concept).filter((f) => !covers.includes(f)),
    mentionsSpecificNumber: last?.mentionsSpecificNumber ?? false,
    childSafeParaphrase: last?.childSafeParaphrase ?? "",
    confidence: last?.confidence ?? 0.5,
  };
}

export const useGame = create<State>((set, get) => ({
  ...initial("equal_groups", freshSeed()),

  start: (concept, seed) => {
    const s = seed ?? freshSeed();
    seedCounter = s;
    set({ ...initial(concept, s) });
  },

  beginFirstWorld: () => {
    track("world_entered", { templateId: get().templateId });
    set({ phase: "notice", nudgeIndex: 0 });
  },

  seeIt: () => set({ phase: "fix", feedback: null }),

  moveCookie: (from, to) => {
    if (from === to) return;
    const w = get().world;
    if (w.kind !== "groups") return;
    const groups = [...w.groups];
    let leftover = w.leftover;
    const take = (k: number | "counter") => {
      if (k === "counter") return leftover > 0 && (leftover--, true);
      return groups[k] > 0 && (groups[k]--, true);
    };
    if (!take(from)) return;
    if (to === "counter") leftover += 1;
    else groups[to] += 1;
    set({ world: { ...w, groups, leftover } });
  },

  setPartition: (patch) => {
    const w = get().world;
    if (w.kind !== "partition") return;
    set({ world: { ...w, ...patch } });
  },

  setCar: (index, value) => {
    const w = get().world;
    if (w.kind !== "sequence") return;
    const terms = [...w.terms];
    terms[index] = value;
    set({ world: { ...w, terms } });
  },

  bumpNudge: () => {
    const t = templateById(get().concept, get().templateId);
    const next = Math.min(get().nudgeIndex + 1, t.nudges.length - 1);
    if (next !== get().nudgeIndex) track("nudge_shown", { level: next });
    set({ nudgeIndex: next });
  },

  checkFix: (claim) => {
    const t = templateById(get().concept, get().templateId);
    const ok = t.isFixed(get().world);
    if (ok) {
      const isTrick = t.exposesFacet === null;
      track("world_fixed", { templateId: t.id, claim, isTrick });
      if (isTrick) track("trick_passed", {});
      set({
        phase: "fixed",
        worldsFixed: get().worldsFixed + 1,
        outcomes: [
          ...get().outcomes,
          { templateId: t.id, exposedFacet: t.exposesFacet, passed: true, isTrick },
        ],
        feedback: {
          tone: "cheer",
          text: isTrick
            ? claim === "nothing"
              ? "You didn't get tricked — it was already right!"
              : "Good eye — it was already right!"
            : "World repaired!",
        },
      });
    } else {
      track("false_fix", { templateId: t.id, claim });
      get().bumpNudge();
      const i = Math.min(get().nudgeIndex, t.nudges.length - 1);
      set({
        feedback: {
          tone: "nudge",
          text:
            claim === "nothing"
              ? "Look again — something still isn't right here."
              : `Not quite yet. ${t.nudges[i]}`,
        },
      });
    }
  },

  toExplain: () => set({ phase: "explain", feedback: null, gained: [], ruleUpgraded: false }),

  submitHypothesis: (text, analysis) => {
    const a = analysis ?? classifyHypothesisLocal(text, get().concept);
    const merged = mergeHypothesis(get().model, a);
    track("hypothesis_given", {});
    track("hypothesis_classified", { covers: a.covers.join(","), missing: a.missing.join(",") });
    if (merged.upgraded) track("rule_upgraded", { gained: merged.gained.join(",") });
    set({
      model: merged.model,
      lastAnalysis: a,
      gained: merged.gained,
      ruleUpgraded: merged.upgraded,
      phase: "mutate",
    });
  },

  analyzeAndSubmit: async (text) => {
    set({ analyzing: true });
    let result: { analysis: HypothesisAnalysis; source: "llm" | "fallback" };
    try {
      const res = await fetch("/api/analyze-hypothesis", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, concept: get().concept }),
      });
      if (!res.ok) throw new Error(String(res.status));
      result = await res.json();
    } catch {
      result = { analysis: classifyHypothesisLocal(text, get().concept), source: "fallback" };
    }
    set({ analyzing: false, analysisSource: result.source });
    get().submitHypothesis(text, result.analysis);
  },

  nextWorld: () => {
    const g = get();
    const seen = [...g.seenTemplateIds, g.templateId];
    const mastery = deriveMastery(g.model, g.outcomes);

    if (mastery === "generalized") {
      track("concept_generalized", { concept: g.concept });
      completeRegion(g.concept);
      saveSession({
        at: new Date().toISOString(),
        concept: g.concept,
        statements: g.model.statements,
        facetsCovered: g.model.covered,
        worldsFixed: g.worldsFixed,
        outcomes: g.outcomes,
        beatTrick: g.outcomes.some((o) => o.isTrick && o.passed),
        masteryState: mastery,
      });
      set({ masteryState: mastery, phase: "generalized", seenTemplateIds: seen });
      return;
    }

    const next = selectTemplate(g.concept, syntheticAnalysis(g.model, g.lastAnalysis), seen);
    track("counterexample_served", { templateId: next.id, exposes: next.exposesFacet ?? "none" });
    seedCounter += 1;
    set({
      seenTemplateIds: seen,
      templateId: next.id,
      world: next.build(seedCounter),
      nudgeIndex: 0,
      phase: "notice",
      masteryState: mastery,
      feedback: null,
    });
  },

  clearFeedback: () => set({ feedback: null }),

  reset: () => set({ ...initial(get().concept, freshSeed()) }),
}));

export type { SequenceWorld };
