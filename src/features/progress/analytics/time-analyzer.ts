export function averageMinutes(minutes: number[]): number {
  if (minutes.length === 0) return 0;
  return Math.round(minutes.reduce((sum, value) => sum + value, 0) / minutes.length);
}