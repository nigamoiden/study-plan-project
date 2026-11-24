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
import {
  createAssessmentSchema,
} from "@/features/assessment/schemas/question.schema";

type Context = {
  params: Promise<{ assessmentId: string }>;
};

export async function PUT(request: NextRequest, context: Context) {
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
      throw new HttpError(404, "Không tìm thấy đề thi.");
    }

    const assessment = assessmentSnap.data()!;

    const creatorRole = assessment.createdByRole ?? (
      assessment.createdBy ? await getUserRole(assessment.createdBy) : undefined
    );
    if (!canManageAuthoredContent(actorRole, user.uid, assessment.createdBy, creatorRole)) {
      throw new HttpError(403, "Bạn không sở hữu đề thi này.");
    }

    if (assessment.status !== "draft") {
      throw new HttpError(409, "Chỉ được sửa đáp án của đề bản nháp.");
    }

    const body = await request.json();

    const parsed = createAssessmentSchema.safeParse({
      ...assessment,
      answerKeys: body.answerKeys,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Đáp án không hợp lệ.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    await answerKeyRef.update({
      answerKeys: parsed.data.answerKeys,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
