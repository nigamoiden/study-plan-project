import { NextRequest, NextResponse } from "next/server";
import {
  adminDb,
  handleApiError,
  HttpError,
  requireAssessmentUser,
  serializeAttempt,
} from "@/server/assessment/http";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAssessmentUser(request);
    const attemptId = request.nextUrl.searchParams.get("attemptId");

    if (!attemptId) {
      throw new HttpError(400, "Thiếu mã lượt thi.");
    }

    const ref = adminDb.collection("assessmentAttempts").doc(attemptId);
    const snap = await ref.get();

    if (!snap.exists) {
      throw new HttpError(404, "Không tìm thấy lượt thi.");
    }

    const data = snap.data()!;

    if (data.userId !== user.uid) {
      throw new HttpError(403, "Bạn không có quyền xem lượt thi này.");
    }

    return NextResponse.json({
      attempt: serializeAttempt(snap.id, data),
    });
  } catch (error) {
    return handleApiError(error);
  }
}