import { aiGradingResultSchema } from "../schemas/grading-result.schema";

export function validateAIGradingResult(value: unknown) {
  return aiGradingResultSchema.safeParse(value);
}