export function profilePriority(level: "weak" | "average" | "good" | "excellent"): number {
  return { weak: 4, average: 3, good: 2, excellent: 1 }[level];
}