import { NextResponse } from "next/server";
import { z } from "zod";
import { narrateReport } from "@/lib/ai/tutor-report";
import type { Report } from "@/lib/report";

export const runtime = "nodejs";

const schema = z.object({
  generatedAt: z.string(),
  regionsCracked: z.number(),
  overall: z.string().max(600),
  concepts: z
    .array(
      z.object({
        concept: z.string(),
        title: z.string(),
        strong: z.boolean(),
        headline: z.string().max(400),
        discovered: z.array(z.string()).max(6),
        missing: z.array(z.string()).max(6),
        journey: z.array(z.string()).max(12),
        beatTrick: z.boolean(),
        recommendedNext: z.string().max(400),
      }),
    )
    .max(4),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid report" }, { status: 400 });
  }
  return NextResponse.json(await narrateReport(parsed.data as Report));
}
