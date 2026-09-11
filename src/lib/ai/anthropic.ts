import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * RuleBreakers only ever calls the model server-side. The model reads the
 * child's words; it never renders worlds, checks fixes, or decides mastery.
 */

export const RB_MODEL = process.env.RULEBREAKERS_MODEL ?? "claude-sonnet-5";

export function hasAnthropicKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim());
}

let cached: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!hasAnthropicKey()) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  cached ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return cached;
}

/** Pull the first text block out of a Messages response. */
export function firstText(message: Anthropic.Message): string {
  for (const block of message.content) {
    if (block.type === "text") return block.text;
  }
  return "";
}

/** Extract a JSON object from a model reply that may wrap it in prose or fences. */
export function extractJson(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : raw).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("no JSON object found in model reply");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}
