import "server-only";

import type {
  DiagnosticAnswer,
  DiagnosticQuestion,
  DiagnosticResult,
} from "@/features/onboarding/types/onboarding.types";

const diagnosticQuestions = [
  {
    id: "math-001",
    subject: "math",
    question: "Đạo hàm của hàm số f(x) = x² là gì?",
    options: ["x", "2x", "x²", "2"],
    correctAnswer: 1,
  },
  {
    id: "math-002",
    subject: "math",
    question: "Giá trị của lim (x² - 1)/(x - 1) khi x tiến đến 1 là:",
    options: ["0", "1", "2", "Không tồn tại"],
    correctAnswer: 2,
  },
  {
    id: "math-003",
    subject: "math",
    question: "Nguyên hàm của 2x là:",
    options: ["x² + C", "2x² + C", "x + C", "2 + C"],
    correctAnswer: 0,
  },
  {
    id: "math-004",
    subject: "math",
    question: "Nghiệm của phương trình x² - 5x + 6 = 0 là:",
    options: [
      "x = 1 và x = 6",
      "x = 2 và x = 3",
      "x = -2 và x = -3",
      "x = 0 và x = 5",
    ],
    correctAnswer: 1,
  },
  {
    id: "math-005",
    subject: "math",
    question: "Đạo hàm của sin(x) là:",
    options: ["-sin(x)", "cos(x)", "-cos(x)", "tan(x)"],
    correctAnswer: 1,
  },
] as const;

export class InvalidDiagnosticAnswersError extends Error {
  constructor() {
    super("Câu trả lời bài kiểm tra đầu vào không hợp lệ.");
    this.name = "InvalidDiagnosticAnswersError";
  }
}

export function getDiagnosticQuestions(): DiagnosticQuestion[] {
  return diagnosticQuestions.map(({ id, subject, question, options }) => ({
    id,
    subject,
    question,
    options: [...options],
  }));
}

export function gradeDiagnosticAnswers(
  answers: DiagnosticAnswer[]
): DiagnosticResult {
  if (answers.length === 0) {
    return {
      answers: [],
      totalQuestions: 0,
      correctAnswers: 0,
      score: 0,
    };
  }

  const answersById = new Map<string, number | null>(
    answers.map((answer) => [answer.questionId, answer.selectedAnswer])
  );
  const expectedIds = new Set<string>(
    diagnosticQuestions.map((question) => question.id)
  );

  if (
    answersById.size !== answers.length ||
    answersById.size !== diagnosticQuestions.length ||
    answers.some(
      (answer) =>
        !expectedIds.has(answer.questionId) ||
        answer.selectedAnswer === null ||
        answer.selectedAnswer < 0 ||
        answer.selectedAnswer >=
          (diagnosticQuestions.find(
            (question) => question.id === answer.questionId
          )?.options.length ?? 0)
    )
  ) {
    throw new InvalidDiagnosticAnswersError();
  }

  const correctAnswers = diagnosticQuestions.reduce(
    (count, question) =>
      count + Number(answersById.get(question.id) === question.correctAnswer),
    0
  );

  return {
    answers,
    totalQuestions: diagnosticQuestions.length,
    correctAnswers,
    score: Math.round((correctAnswers / diagnosticQuestions.length) * 100),
  };
}
