// The child's evolving rule. Each explanation can add facets; when a new facet
// appears *after* a counterexample, that's a "RULE UPGRADED!" moment.

import type { Concept, Facet, HypothesisAnalysis, HypothesisModel } from "@/lib/types";
import { allFacets } from "@/lib/concepts";

export function emptyModel(concept: Concept): HypothesisModel {
  return { concept, covered: [], statements: [] };
}

export interface MergeResult {
  model: HypothesisModel;
  /** facets gained on this step (empty on the very first hypothesis) */
  gained: Facet[];
  upgraded: boolean;
}

export function mergeHypothesis(
  model: HypothesisModel,
  analysis: HypothesisAnalysis,
): MergeResult {
  const before = new Set(model.covered);
  const gained = analysis.covers.filter((f) => !before.has(f));
  const covered = [...model.covered, ...gained];
  const isFirst = model.statements.length === 0;

  return {
    model: {
      concept: model.concept,
      covered,
      statements: [...model.statements, analysis.raw],
    },
    gained,
    upgraded: !isFirst && gained.length > 0,
  };
}

export function isComplete(model: HypothesisModel): boolean {
  const covered = new Set(model.covered);
  return allFacets(model.concept).every((f) => covered.has(f));
}
