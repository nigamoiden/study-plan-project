export interface EssayGradingInput {
  prompt: string;
  answer: string;
  rubric: string[];
  knowledgeContext: string;
  maxScore: number;
}

export interface EssayGradingResult {
  score: number;
  feedback: string;
  model: "ai" | "fallback";
}