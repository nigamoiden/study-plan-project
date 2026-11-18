export function generateFallbackFeedback(score: number): string {
  if (score >= 80) return "Bài làm đáp ứng tốt nội dung và luận giải.";
  if (score >= 50) return "Bài làm có ý chính nhưng cần bổ sung kiến thức và giải thích rõ hơn.";
  return "Bài làm chưa đáp ứng đủ rubric. Hãy xem lại kiến thức của bài học.";
}