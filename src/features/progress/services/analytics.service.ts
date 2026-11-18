export function calculatePercent(completed: number, total: number): number {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}