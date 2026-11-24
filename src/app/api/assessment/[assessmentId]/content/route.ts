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
      throw new HttpError(404, "Không tìm thấy đề thi hoặc đáp án.");
    }

    const current = assessmentSnap.data()!;
    const creatorRole = current.createdByRole ?? (
      current.createdBy ? await getUserRole(current.createdBy) : undefined
    );

    if (
      !canManageAuthoredContent(actorRole, user.uid, current.createdBy, creatorRole)
    ) {
      throw new HttpError(403, "Bạn không sở hữu đề thi này.");
    }

    if (current.status !== "draft") {
      throw new HttpError(409, "Chỉ được sửa nội dung đề bản nháp.");
    }

    const parsed = createAssessmentSchema.safeParse(
      await request.json()
    );

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Nội dung đề không hợp lệ.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const input = parsed.data;

    const totalPoints = input.questions.reduce(
      (sum, question) => sum + question.points,
      0
    );

    const batch = adminDb.batch();

    batch.update(assessmentRef, {
      title: input.title,
      description: input.description ?? "",
      subject: input.subject,
      durationMinutes: input.durationMinutes,
      passingScore: input.passingScore,
      maxAttempts: input.maxAttempts,
      questions: input.questions,
      totalPoints,
      updatedAt: FieldValue.serverTimestamp(),
    });

    batch.update(answerKeyRef, {
      answerKeys: input.answerKeys,
      updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      totalPoints,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
