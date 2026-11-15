import { HttpError } from "./http";

export function assertAttemptCanBeModified(
  attempt: Record<string, any>
) {
  if (attempt.status !== "in_progress") {
    throw new HttpError(409, "Lượt thi đã kết thúc, không thể sửa câu trả lời.");
  }

  const endsAt = attempt.endsAt?.toDate
    ? attempt.endsAt.toDate()
    : new Date(attempt.endsAt);

  if (
    Number.isNaN(endsAt.getTime()) ||
    Date.now() >= endsAt.getTime()
  ) {
    throw new HttpError(409, "Đã hết thời gian làm bài. Hãy nộp bài.");
  }
}

export function assertAnswersMatchQuestions(
  answers: Array<Record<string, any>>,
  questions: Array<Record<string, any>>
) {
  const questionMap = new Map(
    questions.map((question) => [question.id, question])
  );

  const seen = new Set<string>();

  for (const answer of answers) {
    if (seen.has(answer.questionId)) {
      throw new HttpError(400, "Một câu hỏi không được xuất hiện nhiều lần.");
    }

    seen.add(answer.questionId);

    const question = questionMap.get(answer.questionId);

    if (!question) {
      throw new HttpError(400, "Có câu trả lời không thuộc đề thi.");
    }

    if (question.type !== answer.type) {
      throw new HttpError(400, "Loại câu trả lời không khớp câu hỏi.");
    }

    if (answer.type === "multiple_choice") {
      const optionExists = question.options?.some(
        (option: { id: string }) =>
          option.id === answer.selectedOptionId
      );

      if (answer.selectedOptionId !== null && !optionExists) {
        throw new HttpError(400, "Lựa chọn không hợp lệ.");
      }
    }
  }
}