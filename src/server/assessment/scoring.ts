import type {
  Question,
  QuestionAnswer,
  QuestionAnswerKey,
  QuestionResult,
} from "@/features/assessment/types/question.types";

export interface ScoringOutput {
  earnedPoints: number;
  totalPoints: number;
  scorePercentage: number;
  correctAnswers: number;
  totalQuestions: number;
  gradingStatus: "pending" | "partially_graded" | "graded";
  questionResults: QuestionResult[];
}

function normalizeAnswer(value: string): string {
  return value
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("vi-VN");
}

export function gradeAttempt(
  questions: Question[],
  answers: QuestionAnswer[],
  answerKeys: QuestionAnswerKey[]
): ScoringOutput {
  const answerMap = new Map(
    answers.map((answer) => [answer.questionId, answer])
  );

  const keyMap = new Map(
    answerKeys.map((key) => [key.questionId, key])
  );

  let earnedPoints = 0;
  let totalPoints = 0;
  let correctAnswers = 0;
  let pendingCount = 0;

  const questionResults: QuestionResult[] = questions.map((question) => {
    const maxPoints = Number(question.points) || 0;
    totalPoints += maxPoints;

    const answer = answerMap.get(question.id);
    const key = keyMap.get(question.id);

    if (!key) {
      throw new Error(`Missing answer key for question ${question.id}`);
    }

    let isCorrect: boolean | null = false;
    let questionEarned = 0;
    let gradingStatus: "graded" | "pending" = "graded";

    if (question.type === "essay") {
      isCorrect = null;
      gradingStatus = "pending";
      pendingCount++;

      return {
        questionId: question.id,
        earnedPoints: 0,
        maxPoints,
        isCorrect,
        gradingStatus,
      };
    }

    if (!answer || answer.type !== question.type) {
      return {
        questionId: question.id,
        earnedPoints: 0,
        maxPoints,
        isCorrect: false,
        gradingStatus: "graded",
      };
    }

    switch (question.type) {
      case "multiple_choice": {
        const selected =
          answer.type === "multiple_choice"
            ? answer.selectedOptionId
            : null;

        isCorrect =
          selected !== null &&
          selected === key.correctOptionId;

        break;
      }

      case "true_false": {
        const selected =
          answer.type === "true_false"
            ? answer.selectedValue
            : null;

        isCorrect =
          selected !== null &&
          selected === key.correctBoolean;

        break;
      }

      case "short_answer": {
        const submitted =
          answer.type === "short_answer"
            ? normalizeAnswer(answer.answer)
            : "";

        const accepted = (key.acceptedAnswers ?? []).map(
          normalizeAnswer
        );

        isCorrect =
          submitted.length > 0 &&
          accepted.includes(submitted);

        break;
      }
    }

    if (isCorrect) {
      questionEarned = maxPoints;
      correctAnswers++;
    }

    earnedPoints += questionEarned;

    return {
      questionId: question.id,
      earnedPoints: questionEarned,
      maxPoints,
      isCorrect,
      gradingStatus: "graded",
      feedback: key.explanation,
    };
  });

  const scorePercentage =
    totalPoints > 0
      ? Math.round((earnedPoints / totalPoints) * 10000) / 100
      : 0;

  return {
    earnedPoints,
    totalPoints,
    scorePercentage,
    correctAnswers,
    totalQuestions: questions.length,
    gradingStatus:
      pendingCount === 0
        ? "graded"
        : pendingCount === questions.length
          ? "pending"
          : "partially_graded",
    questionResults,
  };
}