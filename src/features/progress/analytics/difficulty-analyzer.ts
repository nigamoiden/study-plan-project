export function classifyDifficulty(score: number): "easy" | "medium" | "hard" {
  if (score >= 80) return "easy";
  if (score >= 50) return "medium";
  return "hard";
}