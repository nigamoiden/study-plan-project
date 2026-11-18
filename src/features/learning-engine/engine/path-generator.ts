export function generateWeekNumbers(totalWeeks: number): number[] {
  return Array.from({ length: totalWeeks }, (_, index) => index + 1);
}