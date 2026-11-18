export function normalizeTopic(topic: string): string {
  return topic.normalize("NFC").trim().replace(/\s+/g, " ");
}