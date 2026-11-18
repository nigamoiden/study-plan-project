import type { EssayGradingInput, EssayGradingResult } from "../types/grading.types";
import { buildEssayGradingPrompt } from "./grading-prompt.service";
import { validateAIGradingResult } from "./grading-validation.service";

export async function parseEssayGradingResponse(
  input: EssayGradingInput,
  rawValue: unknown
): Promise<EssayGradingResult | null> {
  void buildEssayGradingPrompt(input);
  const parsed = validateAIGradingResult(rawValue);
  if (!parsed.success) return null;
  return { ...parsed.data, model: "ai" };
}