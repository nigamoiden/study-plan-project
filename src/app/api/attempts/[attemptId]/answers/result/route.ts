import { NextRequest, NextResponse } from "next/server";
import {
  adminDb,
  handleApiError,
  requireAssessmentUser,
  HttpError,
  toISOString,
} from "@/server/assessment/http";

type Context = {
  params: Promise<{ attemptId: string }>;
};

export async function GET(request: NextRequest, context: Context) {
  try {
    const user = await requireAssessmentUser(request);
    const { attemptId } = await context.params;

    const resultRef = adminDb
      .collection("assessmentResults")
      .doc(attemptId);

    const resultSnap = await resultRef.get();

    if (!resultSnap.exists) {
      throw new HttpError(404, "Chưa có kết quả cho lượt thi này.");
    }

    const data = resultSnap.data()!;

    if (data.userId !== user.uid) {
      throw new HttpError(403, "Bạn không có quyền xem kết quả này.");
    }

    return NextResponse.json({
      result: {
        id: resultSnap.id,
        attemptId: data.attemptId,
        assessmentId: data.assessmentId,
        earnedPoints: data.earnedPoints,
        totalPoints: data.totalPoints,
        scorePercentage: data.scorePercentage,
        correctAnswers: data.correctAnswers,
        totalQuestions: data.totalQuestions,
        gradingStatus: data.gradingStatus,
        questionResults: data.questionResults,
        submittedAt: toISOString(data.submittedAt),
        gradedAt: toISOString(data.gradedAt),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}