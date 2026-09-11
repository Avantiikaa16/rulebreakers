// The counterexample selector — deterministic, concept-agnostic.
// Given the child's classified hypothesis, choose the authored world that best
// exposes the gap. The LLM feeds this; it never picks directly.

import type { Concept, HypothesisAnalysis } from "@/lib/types";
import { allFacets } from "@/lib/concepts";
import { templatesFor } from "@/lib/worlds/registry";
import type { WorldTemplate } from "@/lib/worlds/template";

export function selectTemplate(
  concept: Concept,
  analysis: HypothesisAnalysis | null,
  seenIds: string[],
): WorldTemplate {
  const all = templatesFor(concept);
  const unseen = all.filter((t) => !seenIds.includes(t.id));
  const trick = all.find((t) => t.exposesFacet === null)!;
  if (unseen.length === 0) return trick;

  if (analysis) {
    // order the missing facets, floating count_independence / step_value to the
    // front when the child leaned on a memorised number
    const order = [...analysis.missing];
    if (analysis.mentionsSpecificNumber) {
      order.sort((a, b) => {
        const w = (f: string) => (f === "count_independence" || f === "step_value" ? -1 : 0);
        return w(a) - w(b);
      });
    }
    for (const facet of order) {
      const t = unseen.find((x) => x.exposesFacet === facet);
      if (t) return t;
    }

    const covered = new Set(analysis.covers);
    if (allFacets(concept).every((f) => covered.has(f))) {
      const t = unseen.find((x) => x.exposesFacet === null);
      if (t) return t;
    }
  }

  return unseen[0];
}

/** kept for the equal_groups unit tests */
export function selectGroupsTemplate(
  analysis: HypothesisAnalysis | null,
  seenIds: string[],
): WorldTemplate {
  return selectTemplate("equal_groups", analysis, seenIds);
}
