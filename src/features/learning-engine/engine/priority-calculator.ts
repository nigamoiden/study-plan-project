export function calculateTaskPriority(risk: number, remainingDays: number): number {
  return Math.max(1, Math.round(risk * 10 + remainingDays));
}