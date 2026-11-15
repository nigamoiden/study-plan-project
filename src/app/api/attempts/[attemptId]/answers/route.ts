import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import {
  adminDb,
  handleApiError,
  requireAssessmentUser,
  HttpError,
} from "@/server/assessment/http";
import { gradeAttempt } from "@/server/assessment/scoring";

type Context = {
  params: Promise<{ attemptId: string }>;
};

export async function POST(request: NextRequest, context: Context) {
  try {
    const user = await requireAssessmentUser(request);
    const { attemptId } = await context.params;

    const attemptRef = adminDb
      .collection("assessmentAttempts")
      .doc(attemptId);

    const result = await adminDb.runTransaction(async (tx) => {
      const attemptSnap = await tx.get(attemptRef);

      if (!attemptSnap.exists) {
        throw new HttpError(404, "Không tìm thấy lượt thi.");
      }

      const attempt = attemptSnap.data()!;

      if (attempt.userId !== user.uid) {
        throw new HttpError(403, "Bạn không sở hữu lượt thi này.");
      }

      const resultRef = adminDb
        .collection("assessmentResults")
        .doc(attemptId);

      // Idempotency: nộp lại không tạo kết quả thứ hai.
      const existingResultSnap = await tx.get(resultRef);

      if (existingResultSnap.exists) {
        return {
          result: {
            id: existingResultSnap.id,
            ...existingResultSnap.data(),
          },
          alreadySubmitted: true,
        };
      }

      if (attempt.status !== "in_progress") {
        throw new HttpError(409, "Lượt thi không ở trạng thái có thể nộp.");
      }

      const assessmentRef = adminDb
        .collection("assessments")
        .doc(attempt.assessmentId);

      const answerKeyRef = adminDb
        .collection("assessmentAnswerKeys")
        .doc(attempt.assessmentId);

      const statsRef = adminDb
        .collection("assessmentUserStats")
        .doc(`${attempt.assessmentId}_${user.uid}`);

      const assessmentSnap = await tx.get(assessmentRef);
      const answerKeySnap = await tx.get(answerKeyRef);
      const statsSnap = await tx.get(statsRef);

      if (!assessmentSnap.exists || !answerKeySnap.exists) {
        throw new HttpError(404, "Không tìm thấy đề hoặc đáp án.");
      }

      const assessment = assessmentSnap.data()!;
      const answerKeys = answerKeySnap.data()!.answerKeys ?? [];

      const scoring = gradeAttempt(
        assessment.questions,
        attempt.answers ?? [],
        answerKeys
      );

      const submittedAt = new Date();

      const resultData = {
        attemptId,
        assessmentId: attempt.assessmentId,
        userId: user.uid,
        ...scoring,
        submittedAt,
        gradedAt:
          scoring.gradingStatus === "graded" ? submittedAt : null,
        gradedBy: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      tx.set(resultRef, resultData);

      tx.update(attemptRef, {
        status:
          scoring.gradingStatus === "graded"
            ? "graded"
            : "submitted",
        submittedAt,
        updatedAt: FieldValue.serverTimestamp(),
      });

      if (
        statsSnap.exists &&
        statsSnap.data()?.activeAttemptId === attemptId
      ) {
        tx.update(statsRef, {
          activeAttemptId: null,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      return {
        result: {
          id: resultRef.id,
          ...resultData,
          submittedAt: submittedAt.toISOString(),
        },
        alreadySubmitted: false,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}