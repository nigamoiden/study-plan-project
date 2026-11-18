export function adaptTaskCount(baseCount: number, availability: number): number {
  if (availability <= 0) return 0;
  return Math.max(1, Math.min(baseCount, availability));
}