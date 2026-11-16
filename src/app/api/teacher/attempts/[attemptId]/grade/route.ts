import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import {
  adminDb,
  handleApiError,
  requireAssessmentUser,
  HttpError,
} from "@/server/assessment/http";
import { requireTeacherOrAdmin } from "@/server/assessment/permissions";
import { manualGradeSchema } from "@/features/assessment/schemas/question.schema";

type Context = {
  params: Promise<{ attemptId: string }>;
};

type AssessmentQuestion = {
  id: string;
  type: string;
  points?: number;
  options?: Array<{ id: string }>;
};

type QuestionResultEntry = {
  questionId: string;
  gradingStatus?: string;
  earnedPoints?: number;
  isCorrect?: boolean | null;
  feedback?: string;
};

type GradeInput = {
  questionId: string;
  earnedPoints: number;
  feedback?: string;
};

export async function POST(request: NextRequest, context: Context) {
  try {
    const user = await requireAssessmentUser(request);
    await requireTeacherOrAdmin(user.uid);

    const { attemptId } = await context.params;

    const parsed = manualGradeSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu chấm điểm không hợp lệ.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const attemptRef = adminDb
      .collection("assessmentAttempts")
      .doc(attemptId);

    const resultRef = adminDb
      .collection("assessmentResults")
      .doc(attemptId);

    const response = await adminDb.runTransaction(async (tx) => {
      const attemptSnap = await tx.get(attemptRef);
      const resultSnap = await tx.get(resultRef);

      if (!attemptSnap.exists || !resultSnap.exists) {
        throw new HttpError(404, "Không tìm thấy lượt thi hoặc kết quả.");
      }

      const attempt = attemptSnap.data()!;
      const result = resultSnap.data()!;

      const assessmentRef = adminDb
        .collection("assessments")
        .doc(attempt.assessmentId);

      const assessmentSnap = await tx.get(assessmentRef);

      if (!assessmentSnap.exists) {
        throw new HttpError(404, "Không tìm thấy đề thi.");
      }

      const assessment = assessmentSnap.data()!;

      if (
        assessment.createdBy !== user.uid &&
        (await adminDb.collection("users").doc(user.uid).get()).data()
          ?.role !== "admin"
      ) {
        throw new HttpError(403, "Bạn không có quyền chấm đề thi này.");
      }

      const questionMap = new Map<string, AssessmentQuestion>(
        (assessment.questions as AssessmentQuestion[]).map((question) => [
          question.id,
          question,
        ])
      );

      const resultMap = new Map<string, QuestionResultEntry>(
        (Array.isArray(result.questionResults)
          ? result.questionResults
          : []
        ).map((item: QuestionResultEntry) => [item.questionId, item])
      );

      for (const grade of parsed.data.grades as GradeInput[]) {
        const question = questionMap.get(grade.questionId);

        const currentResult = resultMap.get(grade.questionId);

        if (!question || question.type !== "essay") {
          throw new HttpError(
            400,
            `Câu ${grade.questionId} không phải câu tự luận.`
          );
        }

        if (!currentResult || currentResult.gradingStatus !== "pending") {
          throw new HttpError(
            409,
            `Câu ${grade.questionId} đã được chấm hoặc không tồn tại.`
          );
        }

        const maxPoints = Number(question.points);

        if (grade.earnedPoints > maxPoints) {
          throw new HttpError(
            400,
            `Điểm câu ${grade.questionId} vượt quá điểm tối đa.`
          );
        }

        resultMap.set(grade.questionId, {
          ...currentResult,
          earnedPoints: grade.earnedPoints,
          isCorrect: null,
          gradingStatus: "graded",
          feedback: grade.feedback ?? "",
        });
      }

      const questionResults = Array.from(resultMap.values());

      const pendingCount = questionResults.filter(
        (item) => item.gradingStatus === "pending"
      ).length;

      const earnedPoints = questionResults.reduce(
        (sum: number, item) =>
          sum + Number(item.earnedPoints ?? 0),
        0
      );

      const totalPoints = Number(result.totalPoints);

      const scorePercentage =
        totalPoints > 0
          ? Math.round((earnedPoints / totalPoints) * 10000) / 100
          : 0;

      const gradingStatus =
        pendingCount === 0
          ? "graded"
          : "partially_graded";

      const now = new Date();

      tx.update(resultRef, {
        questionResults,
        earnedPoints,
        scorePercentage,
        gradingStatus,
        gradedAt: pendingCount === 0 ? now : null,
        gradedBy: pendingCount === 0 ? user.uid : null,
        updatedAt: FieldValue.serverTimestamp(),
      });

      if (pendingCount === 0) {
        tx.update(attemptRef, {
          status: "graded",
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      return {
        earnedPoints,
        totalPoints,
        scorePercentage,
        gradingStatus,
        pendingCount,
      };
    });

    return NextResponse.json({
      success: true,
      result: response,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
export async function GET(
  request: NextRequest,
  context: Context
) {
  try {
    const user = await requireAssessmentUser(request);
    await requireTeacherOrAdmin(user.uid);

    const { attemptId } = await context.params;

    const attemptRef = adminDb
      .collection("assessmentAttempts")
      .doc(attemptId);

    const attemptSnap = await attemptRef.get();

    if (!attemptSnap.exists) {
      throw new HttpError(404, "Không tìm thấy lượt thi.");
    }

    const attempt = attemptSnap.data()!;

    const assessmentSnap = await adminDb
      .collection("assessments")
      .doc(attempt.assessmentId)
      .get();

    if (!assessmentSnap.exists) {
      throw new HttpError(404, "Không tìm thấy đề thi.");
    }

    const assessment = assessmentSnap.data()!;

    const profileSnap = await adminDb
      .collection("users")
      .doc(user.uid)
      .get();

    if (
      assessment.createdBy !== user.uid &&
      profileSnap.data()?.role !== "admin"
    ) {
      throw new HttpError(403, "Bạn không có quyền xem bài làm này.");
    }

    const resultSnap = await adminDb
      .collection("assessmentResults")
      .doc(attemptId)
      .get();

    if (!resultSnap.exists) {
      throw new HttpError(409, "Học sinh chưa nộp bài.");
    }

    const result = resultSnap.data()!;

    return NextResponse.json({
      attempt: {
        id: attemptSnap.id,
        assessmentId: attempt.assessmentId,
        userId: attempt.userId,
        status: attempt.status,
        answers: attempt.answers ?? [],
        submittedAt: attempt.submittedAt?.toDate?.().toISOString() ?? null,
      },
      assessment: {
        id: assessmentSnap.id,
        title: assessment.title,
        questions: assessment.questions,
      },
      result: {
        earnedPoints: result.earnedPoints,
        totalPoints: result.totalPoints,
        scorePercentage: result.scorePercentage,
        gradingStatus: result.gradingStatus,
        questionResults: result.questionResults,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}