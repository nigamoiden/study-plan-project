import type {
  PracticeAnswer,
  PracticeGradingResult,
  PracticeItem,
  PracticeQuestion,
  PracticeQuestionGrade,
} from "@/features/practice/types/practice.types";
import { gradeWithAI } from "@/server/grading/ai-grader";

function normalizeText(value: string): string {
  return value
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("vi-VN");
}

function computeKeywordCoverage(answer: string, keywords: string[]): number {
  if (!keywords.length) {
    return answer.length > 0 ? 100 : 0;
  }

  const normalizedAnswer = normalizeText(answer);
  const hits = keywords.filter((keyword) =>
    normalizedAnswer.includes(normalizeText(keyword))
  ).length;

  return Math.min(100, Math.round((hits / keywords.length) * 100));
}

function gradeMultipleChoice(
  question: PracticeQuestion,
  answer: string | boolean | number | null | undefined
) {
  const selected = typeof answer === "string" ? answer : "";
  const isCorrect = selected === question.correctOptionId;

  return {
    score: isCorrect ? 100 : 0,
    feedback: isCorrect
      ? "Bạn đã chọn đáp án đúng."
      : `Đáp án đúng là: ${question.correctOptionId ?? "đã có trong đề"}.`,
  };
}

function gradeShortAnswer(
  question: PracticeQuestion,
  answer: string | boolean | number | null | undefined
) {
  const text = normalizeText(String(answer ?? ""));
  const accepted = (question.acceptedAnswers ?? []).map((item) =>
    normalizeText(item)
  );

  if (!text) {
    return {
      score: 0,
      feedback: "Bạn chưa trả lời câu hỏi này.",
    };
  }

  const isCorrect = accepted.some(
    (item) => item === text || item.includes(text) || text.includes(item)
  );

  return {
    score: isCorrect ? 100 : 65,
    feedback: isCorrect
      ? "Câu trả lời của bạn phù hợp với đáp án mẫu."
      : "Câu trả lời có thể chưa đầy đủ; hãy bổ sung ý chính hoặc từ khóa quan trọng.",
  };
}

function gradeEssay(
  question: PracticeQuestion,
  answer: string | boolean | number | null | undefined
) {
  const text = normalizeText(String(answer ?? ""));

  if (!text) {
    return {
      score: 0,
      feedback: "Bạn chưa viết câu trả lời cho câu này.",
    };
  }

  const keywordCoverage = computeKeywordCoverage(text, question.keywords ?? []);
  const wordCount = text.split(" ").filter(Boolean).length;
  const lengthScore =
    wordCount >= 80
      ? 100
      : Math.min(100, Math.round((wordCount / 80) * 100));
  const clarityScore =
    wordCount >= 12
      ? 100
      : Math.min(100, Math.round((wordCount / 12) * 100));

  const score = Math.round(
    keywordCoverage * 0.65 +
      lengthScore * 0.2 +
      clarityScore * 0.15
  );

  return {
    score,
    feedback:
      score >= 80
        ? "Bài viết của bạn có logic rõ ràng và đáp ứng nhiều tiêu chí của đề."
        : score >= 60
          ? "Bài làm khá tốt, hãy bổ sung thêm chi tiết và nhấn mạnh các ý chính hơn."
          : "Bài làm chưa đạt yêu cầu; hãy mở rộng nội dung và làm rõ các ý tưởng chính.",
  };
}

async function gradeEssayWithFallback(
  question: PracticeQuestion,
  answer: string | boolean | number | null | undefined
) {
  const text = typeof answer === "string" ? answer : "";
  const aiResult = await gradeWithAI({
    prompt: question.prompt,
    answer: text,
    rubric: question.rubric ?? question.keywords ?? [],
    maxScore: 100,
  });

  if (aiResult) {
    return {
      score: aiResult.score,
      feedback: aiResult.feedback,
    };
  }

  return gradeEssay(question, answer);
}

export async function gradePracticeAttempt(
  practice: PracticeItem,
  answers: PracticeAnswer[]
): Promise<PracticeGradingResult> {
  const answerMap = new Map(
    answers.map((answer) => [answer.questionId, answer.answer])
  );

  const details: PracticeQuestionGrade[] = [];

  for (const question of practice.questions) {
    const answer = answerMap.get(question.id);

    let result: { score: number; feedback: string };

    switch (question.type) {
      case "multiple_choice":
        result = gradeMultipleChoice(question, answer);
        break;
      case "short_answer":
        result = gradeShortAnswer(question, answer);
        break;
      case "essay":
        result = await gradeEssayWithFallback(question, answer);
        break;
      default:
        result = { score: 0, feedback: "Loại câu hỏi chưa được hỗ trợ." };
    }

    details.push({
      questionId: question.id,
      score: result.score,
      feedback: result.feedback,
    });
  }

  const totalScore = Math.round(
    details.reduce((sum, detail) => sum + detail.score, 0) /
      Math.max(details.length, 1)
  );

  const passed = totalScore >= (practice.passingScore ?? 70);

  const summary = passed
    ? "Bạn đã đạt mức chuẩn luyện tập theo tiêu chí của bài này."
    : "Bạn đang ở mức chưa đạt, hãy xem lại các câu hỏi chưa chắc chắn và làm lại lần nữa.";

  const feedback = details
    .map((detail) => `Câu ${detail.questionId}: ${detail.feedback}`)
    .join(" ");

  return {
    score: totalScore,
    passed,
    summary,
    feedback,
    details,
  };
}
