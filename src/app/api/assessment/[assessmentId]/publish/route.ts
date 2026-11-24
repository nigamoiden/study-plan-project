import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import {
  adminDb,
  handleApiError,
  requireAssessmentUser,
  HttpError,
} from "@/server/assessment/http";
import { getUserRole, requireTeacherOrAdmin } from "@/server/assessment/permissions";
import { canManageAuthoredContent } from "@/server/learning/lesson-permissions";

type Context = {
  params: Promise<{ assessmentId: string }>;
};

export async function POST(request: NextRequest, context: Context) {
  try {
    const user = await requireAssessmentUser(request);
    const actorRole = await requireTeacherOrAdmin(user.uid);

    const { assessmentId } = await context.params;

    const assessmentRef = adminDb
      .collection("assessments")
      .doc(assessmentId);

    const answerKeyRef = adminDb
      .collection("assessmentAnswerKeys")
      .doc(assessmentId);

    const [assessmentSnap, answerKeySnap] = await Promise.all([
      assessmentRef.get(),
      answerKeyRef.get(),
    ]);

    if (!assessmentSnap.exists || !answerKeySnap.exists) {
      throw new HttpError(404, "Không tìm thấy đề hoặc đáp án.");
    }

    const assessment = assessmentSnap.data()!;
    const answerKeys = answerKeySnap.data()?.answerKeys ?? [];

    const creatorRole = assessment.createdByRole ?? (
      assessment.createdBy ? await getUserRole(assessment.createdBy) : undefined
    );
    if (!canManageAuthoredContent(actorRole, user.uid, assessment.createdBy, creatorRole)) {
      throw new HttpError(403, "Bạn không sở hữu đề thi này.");
    }

    if (assessment.status !== "draft") {
      throw new HttpError(409, "Đề thi không còn ở trạng thái bản nháp.");
    }

    if (
      !Array.isArray(assessment.questions) ||
      assessment.questions.length === 0 ||
      answerKeys.length !== assessment.questions.length
    ) {
      throw new HttpError(400, "Đề thi chưa có đủ câu hỏi và đáp án.");
    }

    await assessmentRef.update({
      status: "published",
      publishedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, status: "published" });
  } catch (error) {
    return handleApiError(error);
  }
}
