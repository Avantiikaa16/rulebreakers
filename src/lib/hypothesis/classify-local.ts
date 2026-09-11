// Offline hypothesis classifier — deterministic keyword heuristics.
// The fallback whenever the LLM route is unavailable or returns junk.

import type { Concept, Facet, HypothesisAnalysis } from "@/lib/types";
import { allFacets } from "@/lib/concepts";

const NUMBER_WORD = /\b(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\b/i;
const DEPENDS = /\b(depend|total|split|divide|how many|share out|each time|keeps? going|next|continue)\b/i;

const SIGNALS: Record<Concept, { facet: Facet; re: RegExp }[]> = {
  equal_groups: [
    { facet: "equality", re: /\b(same|equal|fair|even|match|as much|as many)\b/i },
    { facet: "exhaustiveness", re: /\b(all of (them|it)|use (them |it )?all|share all|none left|nothing left|no leftovers?|every|give (them )?all)\b/i },
    { facet: "count_independence", re: /\b(depend|more|fewer|less|changes?|different amount|how many|split|divide|share out|total)\b/i },
  ],
  equal_partition: [
    { facet: "equal_size", re: /\b(same size|equal|even|fair|match|not bigger|middle|exactly half)\b/i },
    { facet: "part_count", re: /\b(how many pieces|number of pieces|bottom number|denominator|four pieces|three pieces|right amount of (pieces|cuts)|enough pieces)\b/i },
    { facet: "covers_whole", re: /\b(whole (bar|thing|pizza)|all of (the bar|it)|cover|fill|nothing left over|the ends?|every bit)\b/i },
  ],
  skip_count: [
    {
      facet: "constant_step",
      re: /(jump|gap|step|space|difference|goes up|adds?)[\s\w]{0,40}(same|equal|match|every time)|(same|equal)[\s\w]{0,40}(jump|gap|step|difference|amount|each time)|always the same|by the same/i,
    },
    {
      facet: "step_value",
      re: /\b(count(ing)? by|counts? in|jump(s)? of|by (two|three|four|five|ten|\d+)s?|the (jump|step) is|skip( |-)?count)\b/i,
    },
    {
      facet: "extends",
      re: /\b(keeps? going|carry on|goes on|goes forever|carries on|the pattern (continue|goes|keeps)|what comes next|next number|same (all the )?way)\b/i,
    },
  ],
};

export function classifyHypothesisLocal(text: string, concept: Concept): HypothesisAnalysis {
  const clean = text.trim();
  const covers = SIGNALS[concept].filter((s) => s.re.test(clean)).map((s) => s.facet);
  const missing = allFacets(concept).filter((f) => !covers.includes(f));

  const mentionsSpecificNumber = NUMBER_WORD.test(clean) && !DEPENDS.test(clean);

  return {
    raw: clean,
    concept,
    covers,
    missing,
    mentionsSpecificNumber,
    childSafeParaphrase: clean || "…",
    confidence: covers.length > 0 ? 0.6 : 0.3,
  };
}
