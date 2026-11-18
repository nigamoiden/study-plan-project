import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase/admin";
import { gradeWithAI, isAIGradingConfigured } from "@/server/grading/ai-grader";

type EssayAnswer = {
  questionId: string;
  type: "essay";
  answer: string;
};

type Question = {
  id: string;
  type: string;
  content: string;
  points?: number;
};

type AnswerKey = {
  questionId: string;
  acceptedAnswers?: string[];
  explanation?: string;
};

type QuestionResult = {
  questionId: string;
  earnedPoints: number;
  maxPoints: number;
  isCorrect: boolean | null;
  gradingStatus: "graded" | "pending";
  feedback?: string;
};

export async function finishEssayGradingWithAI(attemptId: string) {
  if (!isAIGradingConfigured()) return null;

  const attemptRef = adminDb.collection("assessmentAttempts").doc(attemptId);
  const resultRef = adminDb.collection("assessmentResults").doc(attemptId);

  const [attemptSnap, resultSnap] = await Promise.all([
    attemptRef.get(),
    resultRef.get(),
  ]);

  if (!attemptSnap.exists || !resultSnap.exists) return null;

  const attempt = attemptSnap.data()!;
  const result = resultSnap.data()!;

  if (result.gradingStatus === "graded") return null;

  const [assessmentSnap, answerKeySnap] = await Promise.all([
    adminDb.collection("assessments").doc(attempt.assessmentId).get(),
    adminDb.collection("assessmentAnswerKeys").doc(attempt.assessmentId).get(),
  ]);

  if (!assessmentSnap.exists || !answerKeySnap.exists) return null;

  const questions = (assessmentSnap.data()!.questions ?? []) as Question[];
  const answerKeys = (
    answerKeySnap.data()!.answerKeys ?? []
  ) as AnswerKey[];
  const answers = (attempt.answers ?? []) as EssayAnswer[];
  const questionResults = (
    Array.isArray(result.questionResults) ? result.questionResults : []
  ) as QuestionResult[];

    const questionMap = new Map(questions.map((question) => [question.id, question]));
    const answerMap = new Map(answers.map((answer) => [answer.questionId, answer]));
    const keyMap = new Map(answerKeys.map((key) => [key.questionId, key]));
  let changed = false;

  for (let index = 0; index < questionResults.length; index++) {
    const questionResult = questionResults[index];
    if (questionResult.gradingStatus !== "pending") continue;

    const question = questionMap.get(questionResult.questionId);
    const answer = answerMap.get(questionResult.questionId);
    const answerKey = keyMap.get(questionResult.questionId);

    if (!question || question.type !== "essay" || !answer) continue;

    const aiResult = await gradeWithAI({
      prompt: question.content,
      answer: answer.answer,
      rubric: [
        answerKey?.explanation ?? "Trả lời đúng trọng tâm và có luận giải hợp lý.",
        ...(answerKey?.acceptedAnswers ?? []),
      ].filter(Boolean),
      maxScore: 100,
    });

    if (!aiResult) continue;

    const maxPoints = Number(questionResult.maxPoints ?? question.points ?? 0);
    const earnedPoints =
      Math.round((aiResult.score / 100) * maxPoints * 100) / 100;

    questionResults[index] = {
      ...questionResult,
      earnedPoints,
      isCorrect: null,
      gradingStatus: "graded",
      feedback: aiResult.feedback,
    };
    changed = true;
  }

  if (!changed) return null;

  const pendingCount = questionResults.filter(
    (item) => item.gradingStatus === "pending"
  ).length;
  const earnedPoints = questionResults.reduce(
    (sum, item) => sum + Number(item.earnedPoints ?? 0),
    0
  );
  const totalPoints = Number(result.totalPoints ?? 0);
  const scorePercentage =
    totalPoints > 0
      ? Math.round((earnedPoints / totalPoints) * 10000) / 100
      : 0;
  const gradingStatus =
    pendingCount === 0 ? "graded" : "partially_graded";
  const now = new Date();

  await adminDb.runTransaction(async (tx) => {
    tx.update(resultRef, {
      questionResults,
      earnedPoints,
      scorePercentage,
      gradingStatus,
      gradedAt: pendingCount === 0 ? now : null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    if (pendingCount === 0) {
      tx.update(attemptRef, {
        status: "graded",
        submittedAt: result.submittedAt ?? now,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  });

  return {
    earnedPoints,
    totalPoints,
    scorePercentage,
    gradingStatus,
    questionResults,
  };
}
