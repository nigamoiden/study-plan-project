export function evaluateAnswerQuality(answer: string): number {
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  if (!answer.trim()) return 0;
  if (words >= 80) return 100;
  if (words >= 30) return 75;
  if (words >= 12) return 50;
  return 25;
}