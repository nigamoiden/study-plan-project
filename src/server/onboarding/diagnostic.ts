import "server-only";

import type {
  DiagnosticAnswer,
  DiagnosticQuestion,
  DiagnosticResult,
} from "@/features/onboarding/types/onboarding.types";
import { adminDb } from "@/lib/firebase/admin";
import type { SubjectName } from "@/features/onboarding/types/onboarding.types";

type StoredDiagnosticQuestion = {
  id: string;
  subject: SubjectName;
  question: string;
  options: string[];
  correctAnswer: number;
  active: boolean;
};

async function getStoredDiagnosticQuestions(): Promise<StoredDiagnosticQuestion[]> {
  const snapshot = await adminDb
    .collection("onboardingQuestions")
    .where("active", "==", true)
    .limit(200)
    .get();

  return snapshot.docs.map((document) => {
    const data = document.data();
    return {
      id: document.id,
      subject: data.subject,
      question: data.question,
      options: Array.isArray(data.options) ? data.options.map(String) : [],
      correctAnswer: Number(data.correctAnswer),
      active: data.active !== false,
    };
  });
}

export class InvalidDiagnosticAnswersError extends Error {
  constructor() {
    super("Câu trả lời bài kiểm tra đầu vào không hợp lệ.");
    this.name = "InvalidDiagnosticAnswersError";
  }
}

export async function getDiagnosticQuestions(): Promise<DiagnosticQuestion[]> {
  const diagnosticQuestions = await getStoredDiagnosticQuestions();
  return diagnosticQuestions.map(({ id, subject, question, options }) => ({
    id,
    subject,
    question,
    options: [...options],
  }));
}

export async function gradeDiagnosticAnswers(
  answers: DiagnosticAnswer[]
): Promise<DiagnosticResult> {
  const diagnosticQuestions = await getStoredDiagnosticQuestions();
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
