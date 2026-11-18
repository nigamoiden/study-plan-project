export function identifyWeakAreas(scores: Record<string, number>): string[] {
  return Object.entries(scores)
    .filter(([, score]) => score < 70)
    .sort((left, right) => left[1] - right[1])
    .map(([subject]) => subject);
}