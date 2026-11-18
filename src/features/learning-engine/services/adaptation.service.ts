export function sortTasksByDate<T extends { date: string }>(tasks: T[]): T[] {
  return [...tasks].sort((left, right) => left.date.localeCompare(right.date));
}