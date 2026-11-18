import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import {
  adminDb,
  handleApiError,
  requireAssessmentUser,
  HttpError,
} from "@/server/assessment/http";
import { requireTeacherOrAdmin } from "@/server/assessment/permissions";
import {
  updateAssessmentSchema,
} from "@/features/assessment/schemas/question.schema";

type Context = {
  params: Promise<{ assessmentId: string }>;
};

export async function GET(request: NextRequest, context: Context) {
  try {
    const user = await requireAssessmentUser(request);
    const { assessmentId } = await context.params;

    const ref = adminDb.collection("assessments").doc(assessmentId);
    const snap = await ref.get();

    if (!snap.exists) {
      throw new HttpError(404, "Không tìm thấy đề thi.");
    }

    const data = snap.data()!;

    if (
      data.status !== "published" &&
      data.createdBy !== user.uid
    ) {
      const profile = await adminDb.collection("users").doc(user.uid).get();
      if (profile.data()?.role !== "admin") {
        throw new HttpError(404, "Không tìm thấy đề thi.");
      }
    }

    return NextResponse.json({
      assessment: {
        id: snap.id,
        title: data.title,
        description: data.description ?? "",
        subject: data.subject,
        durationMinutes: data.durationMinutes,
        passingScore: data.passingScore,
        totalPoints: data.totalPoints,
        maxAttempts: data.maxAttempts,
        questions: data.questions,
        status: data.status,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const user = await requireAssessmentUser(request);
    await requireTeacherOrAdmin(user.uid);

    const { assessmentId } = await context.params;
    const ref = adminDb.collection("assessments").doc(assessmentId);
    const snap = await ref.get();

    if (!snap.exists) {
      throw new HttpError(404, "Không tìm thấy đề thi.");
    }

    const existing = snap.data()!;

    if (
      existing.createdBy !== user.uid &&
      (await adminDb.collection("users").doc(user.uid).get()).data()
        ?.role !== "admin"
    ) {
      throw new HttpError(403, "Bạn không sở hữu đề thi này.");
    }

    if (existing.status !== "draft") {
      throw new HttpError(
        409,
        "Chỉ có thể chỉnh sửa đề thi ở trạng thái bản nháp."
      );
    }

    const parsed = updateAssessmentSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updates = parsed.data;

    const updateData: Record<string, unknown> = {
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (updates.questions) {
      const ids = updates.questions.map((question) => question.id);

      if (new Set(ids).size !== ids.length) {
        throw new HttpError(400, "ID câu hỏi bị trùng.");
      }

      updateData.totalPoints = updates.questions.reduce(
        (sum, question) => sum + question.points,
        0
      );
    }

    delete updateData.answerKeys;

    await ref.update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const user = await requireAssessmentUser(request);
    await requireTeacherOrAdmin(user.uid);

    const { assessmentId } = await context.params;

    const ref = adminDb.collection("assessments").doc(assessmentId);
    const snap = await ref.get();

    if (!snap.exists) {
      throw new HttpError(404, "Không tìm thấy đề thi.");
    }

    const data = snap.data()!;

    if (
      data.createdBy !== user.uid &&
      (await adminDb.collection("users").doc(user.uid).get()).data()
        ?.role !== "admin"
    ) {
      throw new HttpError(403, "Bạn không sở hữu đề thi này.");
    }

    if (data.status === "published") {
      throw new HttpError(
        409,
        "Hãy lưu trữ đề thi trước khi xóa."
      );
    }

    const batch = adminDb.batch();

    batch.delete(ref);
    batch.delete(
      adminDb.collection("assessmentAnswerKeys").doc(assessmentId)
    );

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}