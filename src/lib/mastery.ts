// Concept mastery — the LLM never sets this. Only accumulated evidence advances it.

import type { Facet, HypothesisModel, MasteryState } from "./types";
import { isComplete } from "./hypothesis/model";

export interface WorldOutcome {
  templateId: string;
  exposedFacet: Facet | null;
  /** true = repaired correctly, or (for the trick) correctly left alone */
  passed: boolean;
  isTrick: boolean;
}

export function deriveMastery(model: HypothesisModel, outcomes: WorldOutcome[]): MasteryState {
  if (model.statements.length === 0) return "exploring";

  const servedAfterHypothesis = outcomes.length >= 2; // opener + at least one counterexample
  if (!servedAfterHypothesis) return "hypothesizing";

  const beatATrick = outcomes.some((o) => o.isTrick && o.passed);
  const fixedARealCounterexample = outcomes.some(
    (o) => !o.isTrick && o.passed && o.exposedFacet !== null,
  );

  if (isComplete(model) && beatATrick && fixedARealCounterexample) return "generalized";
  return "testing";
}

export function isGeneralized(model: HypothesisModel, outcomes: WorldOutcome[]): boolean {
  return deriveMastery(model, outcomes) === "generalized";
}
