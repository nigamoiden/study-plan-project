import { z } from "zod";

export const aiGradingResultSchema = z.object({
  score: z.number().int().min(0).max(100),
  feedback: z.string().trim().min(1).max(10000),
});