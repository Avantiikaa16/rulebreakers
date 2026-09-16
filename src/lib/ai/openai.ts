import "server-only";
import OpenAI from "openai";

/**
 * RuleBreakers only ever calls the model server-side. The model reads the
 * child's words; it never renders worlds, checks fixes, or decides mastery.
 *
 * Provider is picked automatically, in order: Groq (free tier, OpenAI-compatible
 * API) → OpenAI → offline deterministic fallback. Whichever key is present wins;
 * if both are set, Groq is preferred since it needs no billing to run.
 */

type Provider = "groq" | "openai" | "none";

function provider(): Provider {
  if (process.env.GROQ_API_KEY?.trim()) return "groq";
  if (process.env.OPENAI_API_KEY?.trim()) return "openai";
  return "none";
}

export const RB_MODEL = (() => {
  const p = provider();
  if (p === "groq") return process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
  return process.env.OPENAI_MODEL ?? "gpt-4o-mini";
})();

export function hasOpenAIKey(): boolean {
  return provider() !== "none";
}

let cached: OpenAI | null = null;
let cachedFor: Provider | null = null;

export function getOpenAI(): OpenAI {
  const p = provider();
  if (p === "none") {
    throw new Error("Neither GROQ_API_KEY nor OPENAI_API_KEY is set");
  }
  if (cached && cachedFor === p) return cached;

  cached =
    p === "groq"
      ? new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" })
      : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  cachedFor = p;
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
