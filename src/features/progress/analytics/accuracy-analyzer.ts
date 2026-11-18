export function accuracyPercentage(correct: number, total: number): number {
  return total > 0 ? Math.round((correct / total) * 100) : 0;
}