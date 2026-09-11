import "server-only";
import type { Report } from "@/lib/report";
import { firstText, getAnthropic, hasAnthropicKey, RB_MODEL } from "./anthropic";

export interface NarrateResult {
  note: string;
  source: "llm" | "fallback";
}

function fallback(r: Report): string {
  const parts = r.concepts.map((c) => c.headline);
  return [r.overall, ...parts].join(" ");
}

const SYSTEM = [
  "You write a short handoff note for a 1:1 math tutor about a 6-9 year old who just used RuleBreakers,",
  "a game where kids spot what's broken in a scene, fix it, then say the rule in their own words while the",
  "AI generates counterexamples that test their rule.",
  "Use ONLY the facts given. No scores, no invented detail, no praise inflation.",
  "3-5 sentences, warm, specific, tutor-to-tutor. Plain text only.",
].join("\n");

export async function narrateReport(report: Report): Promise<NarrateResult> {
  if (!hasAnthropicKey()) return { note: fallback(report), source: "fallback" };
  try {
    const facts = [
      `Regions cracked: ${report.regionsCracked}.`,
      report.overall,
      ...report.concepts.map(
        (c) =>
          `${c.title}: ${c.strong ? "fully generalised" : "partial"}. Discovered — ${c.discovered.join("; ") || "none"}. ` +
          `Still missing — ${c.missing.join("; ") || "none"}. Beat the trick world: ${c.beatTrick}. ` +
          `Their words in order: ${c.journey.map((s) => `"${s}"`).join(" → ")}.`,
      ),
    ].join("\n");

    const res = await getAnthropic().messages.create({
      model: RB_MODEL,
      max_tokens: 400,
      system: SYSTEM,
      output_config: { effort: "low" },
      messages: [{ role: "user", content: facts }],
    });
    const note = firstText(res).trim();
    return note ? { note, source: "llm" } : { note: fallback(report), source: "fallback" };
  } catch {
    return { note: fallback(report), source: "fallback" };
  }
}
