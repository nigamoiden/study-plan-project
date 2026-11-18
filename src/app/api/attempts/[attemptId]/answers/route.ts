import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import {
  adminDb,
  handleApiError,
  requireAssessmentUser,
  HttpError,
} from "@/server/assessment/http";
import { gradeAttempt } from "@/server/assessment/scoring";
import { finishEssayGradingWithAI } from "@/server/assessment/ai-grading";
import { saveAnswersSchema } from "@/features/assessment/schemas/question.schema";

type Context = {
  params: Promise<{ attemptId: string }>;
};

export async function PUT(request: NextRequest, context: Context) {
  try {
    const user = await requireAssessmentUser(request);
    const { attemptId } = await context.params;
    const parsed = saveAnswersSchema.safeParse(await request.json());

    if (!parsed.success) {
      throw new HttpError(400, "Danh sách câu trả lời không hợp lệ.");
    }

    const attemptRef = adminDb.collection("assessmentAttempts").doc(attemptId);
    await adminDb.runTransaction(async (tx) => {
      const attemptSnapshot = await tx.get(attemptRef);

      if (!attemptSnapshot.exists) {
        throw new HttpError(404, "Không tìm thấy lượt thi.");
      }

      const attempt = attemptSnapshot.data()!;
      if (attempt.userId !== user.uid) {
        throw new HttpError(403, "Bạn không sở hữu lượt thi này.");
      }
      if (attempt.status !== "in_progress") {
        throw new HttpError(409, "Lượt thi không còn nhận câu trả lời.");
      }

      const assessmentSnapshot = await tx.get(
        adminDb.collection("assessments").doc(attempt.assessmentId)
      );
      if (!assessmentSnapshot.exists) {
        throw new HttpError(404, "Không tìm thấy đề thi.");
      }

      const questions = assessmentSnapshot.data()!.questions as Array<{
        id: string;
        type: string;
        options?: Array<{ id: string }>;
      }>;
      const questionById = new Map(questions.map((question) => [question.id, question]));
      const answerIds = parsed.data.answers.map((answer) => answer.questionId);

      if (new Set(answerIds).size !== answerIds.length) {
        throw new HttpError(400, "Không thể gửi nhiều câu trả lời cho cùng một câu hỏi.");
      }

      for (const answer of parsed.data.answers) {
        const question = questionById.get(answer.questionId);
        if (!question || question.type !== answer.type) {
          throw new HttpError(400, `Câu trả lời ${answer.questionId} không khớp với đề thi.`);
        }

        if (
          answer.type === "multiple_choice" &&
          answer.selectedOptionId !== null &&
          !question.options?.some((option) => option.id === answer.selectedOptionId)
        ) {
          throw new HttpError(400, `Lựa chọn của câu ${answer.questionId} không hợp lệ.`);
        }
      }

      const endsAt = attempt.endsAt?.toDate?.();
      if (endsAt instanceof Date && Date.now() >= endsAt.getTime()) {
        throw new HttpError(409, "Đã hết thời gian làm bài.");
      }

      tx.update(attemptRef, {
        answers: parsed.data.answers,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

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

    if (!result.alreadySubmitted) {
      const aiResult = await finishEssayGradingWithAI(attemptId);
      if (aiResult) {
        result.result = {
          ...result.result,
          ...aiResult,
        };
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}