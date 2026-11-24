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

    const ref = adminDb.collection("assessments").doc(assessmentId);
    const snap = await ref.get();

    if (!snap.exists) {
      throw new HttpError(404, "Không tìm thấy đề thi.");
    }

    const assessment = snap.data()!;

    const creatorRole = assessment.createdByRole ?? (
      assessment.createdBy ? await getUserRole(assessment.createdBy) : undefined
    );
    if (!canManageAuthoredContent(actorRole, user.uid, assessment.createdBy, creatorRole)) {
      throw new HttpError(403, "Bạn không sở hữu đề thi này.");
    }

    if (assessment.status !== "published") {
      throw new HttpError(409, "Chỉ có thể lưu trữ đề đã xuất bản.");
    }

    await ref.update({
      status: "archived",
      archivedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      status: "archived",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
