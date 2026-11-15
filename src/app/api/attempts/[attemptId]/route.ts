import { NextRequest, NextResponse } from "next/server";

import {
  adminDb,
  handleApiError,
  HttpError,
  requireAssessmentUser,
  serializeAttempt,
} from "@/server/assessment/http";

type Context = {
  params: Promise<{ attemptId: string }>;
};

export async function GET(request: NextRequest, context: Context) {
  try {
    const user = await requireAssessmentUser(request);
    const { attemptId } = await context.params;
    const attemptRef = adminDb.collection("assessmentAttempts").doc(attemptId);
    const attemptSnapshot = await attemptRef.get();

    if (!attemptSnapshot.exists) {
      throw new HttpError(404, "Không tìm thấy lượt thi.");
    }

    const attempt = attemptSnapshot.data()!;
    if (attempt.userId !== user.uid) {
      throw new HttpError(403, "Bạn không có quyền xem lượt thi này.");
    }

    return NextResponse.json({
      attempt: serializeAttempt(attemptSnapshot.id, attempt),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
