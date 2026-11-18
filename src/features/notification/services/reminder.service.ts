export function buildStudyReminder(taskTitle: string, minutes: number): string {
  return `Nhắc học: “${taskTitle}” — dành khoảng ${minutes} phút để hoàn thành nhiệm vụ.`;
}