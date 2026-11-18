import type { EssayGradingInput } from "../types/grading.types";

export function buildEssayGradingPrompt(input: EssayGradingInput): string {
  return [
    `Câu hỏi: ${input.prompt}`,
    `Kiến thức của bài học: ${input.knowledgeContext}`,
    `Rubric: ${input.rubric.join("; ")}`,
    `Bài làm: ${input.answer}`,
    `Thang điểm: 0-${input.maxScore}`,
  ].join("\n");
}