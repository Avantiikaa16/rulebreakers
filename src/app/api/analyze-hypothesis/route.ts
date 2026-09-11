import { NextResponse } from "next/server";
import { analyzeHypothesisRequestSchema } from "@/lib/schemas";
import { classifyHypothesisLocal } from "@/lib/hypothesis/classify-local";
import { analyzeHypothesis } from "@/lib/ai/analyze-hypothesis";

export const runtime = "nodejs";
export const maxDuration = 20;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const parsed = analyzeHypothesisRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request", details: parsed.error.issues }, { status: 400 });
  }

  try {
    return NextResponse.json(await analyzeHypothesis(parsed.data.text, parsed.data.concept));
  } catch {
    return NextResponse.json({
      analysis: classifyHypothesisLocal(parsed.data.text, parsed.data.concept),
      source: "fallback",
    });
  }
}
