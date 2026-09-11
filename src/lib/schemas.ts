import { z } from "zod";

export const facetSchema = z.enum([
  "equality",
  "exhaustiveness",
  "count_independence",
  "equal_size",
  "part_count",
  "covers_whole",
  "constant_step",
  "step_value",
  "extends",
]);

export const conceptSchema = z.enum(["equal_groups", "equal_partition", "skip_count"]);

export const hypothesisAnalysisSchema = z.object({
  raw: z.string().max(600),
  concept: conceptSchema,
  covers: z.array(facetSchema).max(9),
  missing: z.array(facetSchema).max(9),
  mentionsSpecificNumber: z.boolean(),
  childSafeParaphrase: z.string().min(1).max(200),
  confidence: z.number().min(0).max(1),
});

export const analyzeHypothesisRequestSchema = z.object({
  text: z.string().min(1).max(600),
  concept: conceptSchema,
});

export type HypothesisAnalysisDTO = z.infer<typeof hypothesisAnalysisSchema>;
