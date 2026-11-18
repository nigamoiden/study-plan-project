export function splitStudyMinutes(totalMinutes: number): { learn: number; practice: number } {
  const learn = Math.max(5, Math.floor(totalMinutes / 2));
  return { learn, practice: Math.max(5, totalMinutes - learn) };
}