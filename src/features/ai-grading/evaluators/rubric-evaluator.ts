export function countRubricMatches(answer: string, rubric: string[]): number {
  if (rubric.length === 0) return 0;
  const normalized = answer.normalize("NFC").trim().toLocaleLowerCase("vi-VN");
  return rubric.filter((item) =>
    normalized.includes(item.normalize("NFC").trim().toLocaleLowerCase("vi-VN"))
  ).length;
}