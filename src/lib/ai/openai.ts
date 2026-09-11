import "server-only";
import OpenAI from "openai";

/**
 * RuleBreakers only ever calls the model server-side. The model reads the
 * child's words; it never renders worlds, checks fixes, or decides mastery.
 */

export const RB_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export function hasOpenAIKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());
}

let cached: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!hasOpenAIKey()) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  cached ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return cached;
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
