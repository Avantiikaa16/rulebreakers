import "server-only";
import type { Concept, HypothesisAnalysis } from "@/lib/types";
import { hypothesisAnalysisSchema } from "@/lib/schemas";
import { CONCEPTS } from "@/lib/concepts";
import { classifyHypothesisLocal } from "@/lib/hypothesis/classify-local";
import { extractJson, firstText, getAnthropic, hasAnthropicKey, RB_MODEL } from "./anthropic";

export interface AnalyzeResult {
  analysis: HypothesisAnalysis;
  source: "llm" | "fallback";
}

function systemPrompt(concept: Concept): string {
  const def = CONCEPTS[concept];
  const facetLines = def.facets
    .map((f) => `- ${f.facet}: the idea that ${f.kidRule}`)
    .join("\n");
  return [
    `A child (age 6-9) just repaired a broken "${def.title}" world and said WHY it was wrong.`,
    "Your only job is to read their sentence and mark which parts of the full idea they clearly expressed.",
    "You do NOT judge if they are right, do NOT do any math, do NOT decide what happens next.",
    "",
    `The full idea has these parts:`,
    facetLines,
    "",
    "Rules:",
    "- 'covers' = parts they clearly said. 'missing' = the rest.",
    "- Only mark a part as covered if the words really show it — not if you're being generous.",
    "- 'mentionsSpecificNumber' = true if they named a fixed amount ('everyone needs four') without any sense that it depends on the total.",
    "- 'childSafeParaphrase' = their rule in <=14 kind words, no praise, no correction.",
    "",
    "Reply with ONLY this JSON:",
    '{"raw": string, "concept": string, "covers": string[], "missing": string[],',
    ' "mentionsSpecificNumber": boolean, "childSafeParaphrase": string, "confidence": number 0-1}',
  ].join("\n");
}

async function callModel(text: string, concept: Concept, repair: boolean): Promise<HypothesisAnalysis> {
  const messages: { role: "user" | "assistant"; content: string }[] = [
    { role: "user", content: `Child said: "${text}"` },
  ];
  if (repair) {
    messages.push({ role: "assistant", content: "I will reply with only valid JSON." });
    messages.push({ role: "user", content: "That was not valid JSON in the required shape. Reply again with only the JSON object." });
  }
  const res = await getAnthropic().messages.create({
    model: RB_MODEL,
    max_tokens: 400,
    system: systemPrompt(concept),
    output_config: { effort: "low" },
    messages,
  });
  return hypothesisAnalysisSchema.parse(extractJson(firstText(res)));
}

/** Never throws — the game always gets a usable analysis. */
export async function analyzeHypothesis(text: string, concept: Concept): Promise<AnalyzeResult> {
  if (hasAnthropicKey()) {
    try {
      return { analysis: await callModel(text, concept, false), source: "llm" };
    } catch {
      try {
        return { analysis: await callModel(text, concept, true), source: "llm" };
      } catch {
        /* fall through */
      }
    }
  }
  return { analysis: classifyHypothesisLocal(text, concept), source: "fallback" };
}
