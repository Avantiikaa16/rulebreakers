// Deterministic Tutor Handoff Report. The engine decides everything here from
// the session evidence; an optional LLM pass only rephrases it in tutor language.

import type { Facet, SessionSummary } from "./types";
import { CONCEPTS, facetDef } from "./concepts";

export interface ConceptReport {
  concept: string;
  title: string;
  strong: boolean;
  headline: string;
  discovered: string[]; // kid-rule phrasing of each facet, in the order covered
  missing: string[];
  journey: string[]; // the child's own words, in order
  beatTrick: boolean;
  recommendedNext: string;
}

export interface Report {
  generatedAt: string;
  regionsCracked: number;
  concepts: ConceptReport[];
  overall: string;
}

const NEXT_STEP: Record<string, string> = {
  equal_groups:
    "Move to division with remainders, and to unequal-share word problems where 'fair' has to be defended.",
  equal_partition:
    "Compare fractions of the same whole (is 1/3 or 1/4 bigger?) and partition sets as well as shapes.",
  skip_count:
    "Introduce patterns that grow by a changing amount, and skip-counting from a non-zero start.",
};

function conceptReport(s: SessionSummary): ConceptReport {
  const def = CONCEPTS[s.concept];
  const all = def.facets.map((f) => f.facet);
  const covered = s.facetsCovered;
  const missing = all.filter((f) => !covered.includes(f));
  const strong = missing.length === 0 && s.beatTrick;

  const kid = (f: Facet) => facetDef(s.concept, f)?.kidRule ?? f;

  return {
    concept: s.concept,
    title: def.title,
    strong,
    headline: strong
      ? `Discovered the full rule for "${def.title}" by repairing ${s.worldsFixed} worlds, and did not get tricked by the "nothing is wrong" world.`
      : `Engaged the ${def.title} loop (${s.worldsFixed} worlds) but the rule is still partial.`,
    discovered: covered.map(kid),
    missing: missing.map(kid),
    journey: s.statements,
    beatTrick: s.beatTrick,
    recommendedNext: NEXT_STEP[s.concept] ?? "",
  };
}

export function buildReport(sessions: SessionSummary[]): Report {
  const concepts = sessions
    .sort((a, b) => a.at.localeCompare(b.at))
    .map(conceptReport);
  const strongCount = concepts.filter((c) => c.strong).length;
  return {
    generatedAt: new Date().toISOString(),
    regionsCracked: concepts.length,
    concepts,
    overall:
      concepts.length === 0
        ? "No regions completed yet."
        : `The learner works by noticing a fault, forming a rule in their own words, then revising it when a counterexample breaks it — the scientific-method loop. ${strongCount} of ${concepts.length} rules are fully generalised.`,
  };
}
