// Concept + facet definitions. Child-facing language is attached *after* discovery
// (experience first, vocabulary second).

import type { Concept, Facet } from "./types";

export interface FacetDef {
  facet: Facet;
  /** plain words a 7-year-old would use */
  kidRule: string;
  /** the math name, revealed after they discover it */
  mathName: string;
}

export interface ConceptDef {
  concept: Concept;
  title: string;
  region: string;
  facets: FacetDef[];
  /** the full idea, once every facet is covered */
  bigIdea: string;
}

export const CONCEPTS: Record<Concept, ConceptDef> = {
  equal_groups: {
    concept: "equal_groups",
    title: "Fair Shares",
    region: "Dragon Bakery",
    bigIdea: "Sharing fairly means every group gets the same amount AND you use all of it.",
    facets: [
      { facet: "equality", kidRule: "everyone gets the same amount", mathName: "equal groups" },
      { facet: "exhaustiveness", kidRule: "you share all of them, none left over", mathName: "sharing the whole set" },
      { facet: "count_independence", kidRule: "the amount changes when there's more or fewer", mathName: "division (total ÷ groups)" },
    ],
  },
  equal_partition: {
    concept: "equal_partition",
    title: "Fair Pieces",
    region: "Fraction Café",
    bigIdea: "A fraction means equal-size pieces that together make one whole.",
    facets: [
      { facet: "equal_size", kidRule: "the pieces are the same size", mathName: "equal parts" },
      { facet: "part_count", kidRule: "the bottom number tells how many pieces", mathName: "the denominator" },
      { facet: "covers_whole", kidRule: "the pieces fill the whole thing", mathName: "partitioning the whole" },
    ],
  },
  skip_count: {
    concept: "skip_count",
    title: "Steady Steps",
    region: "Number Railway",
    bigIdea: "A counting pattern jumps by the same amount every single time.",
    facets: [
      { facet: "constant_step", kidRule: "it jumps the same amount each time", mathName: "constant difference" },
      { facet: "step_value", kidRule: "you can tell which jump it is (2s, 5s, 10s)", mathName: "the common difference" },
      { facet: "extends", kidRule: "the pattern keeps going the same way", mathName: "extending the rule" },
    ],
  },
};

export function facetDef(concept: Concept, facet: Facet): FacetDef | undefined {
  return CONCEPTS[concept].facets.find((f) => f.facet === facet);
}

export function allFacets(concept: Concept): Facet[] {
  return CONCEPTS[concept].facets.map((f) => f.facet);
}
