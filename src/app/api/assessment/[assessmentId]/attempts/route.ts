import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import {
  adminDb,
  handleApiError,
  requireAssessmentUser,
  HttpError,
  serializeAttempt,
} from "@/server/assessment/http";

type Context = {
  params: Promise<{ assessmentId: string }>;
};

export async function POST(request: NextRequest, context: Context) {
  try {
    const user = await requireAssessmentUser(request);
    const { assessmentId } = await context.params;

    const assessmentRef = adminDb
      .collection("assessments")
      .doc(assessmentId);

    const statsRef = adminDb
      .collection("assessmentUserStats")
      .doc(`${assessmentId}_${user.uid}`);

    const newAttemptRef = adminDb
      .collection("assessmentAttempts")
      .doc();

    const result = await adminDb.runTransaction(async (tx) => {
      const assessmentSnap = await tx.get(assessmentRef);
      const statsSnap = await tx.get(statsRef);

      if (!assessmentSnap.exists) {
        throw new HttpError(404, "Không tìm thấy đề thi.");
      }

      const assessment = assessmentSnap.data()!;

      if (assessment.status !== "published") {
        throw new HttpError(404, "Đề thi chưa được xuất bản.");
      }

      const stats = statsSnap.data() ?? {
        attemptsUsed: 0,
        activeAttemptId: null,
      };

      // Tiếp tục lượt thi đang hoạt động nếu còn thời gian.
      if (stats.activeAttemptId) {
        const activeRef = adminDb
          .collection("assessmentAttempts")
          .doc(stats.activeAttemptId);

        const activeSnap = await tx.get(activeRef);

        if (activeSnap.exists) {
          const active = activeSnap.data()!;

          const endsAt = active.endsAt.toDate();

          if (
            active.status === "in_progress" &&
            Date.now() < endsAt.getTime()
          ) {
            return {
              attempt: serializeAttempt(activeSnap.id, active),
              resumed: true,
            };
          }

          if (active.status === "in_progress") {
            return {
              attempt: serializeAttempt(activeSnap.id, active),
              resumed: true,
              expired: true,
            };
          }
        }
      }

      const maxAttempts = Number(assessment.maxAttempts ?? 1);
      const attemptsUsed = Number(stats.attemptsUsed ?? 0);

      if (attemptsUsed >= maxAttempts) {
        throw new HttpError(403, "Bạn đã sử dụng hết số lượt thi.");
      }

      const now = new Date();
      const endsAt = new Date(
        now.getTime() + assessment.durationMinutes * 60 * 1000
      );

      const attemptData = {
        assessmentId,
        userId: user.uid,
        status: "in_progress",
        answers: [],
        startedAt: now,
        endsAt,
        submittedAt: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      tx.set(newAttemptRef, attemptData);

      tx.set(
        statsRef,
        {
          attemptsUsed: attemptsUsed + 1,
          activeAttemptId: newAttemptRef.id,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return {
        attempt: {
          id: newAttemptRef.id,
          ...attemptData,
          startedAt: now.toISOString(),
          endsAt: endsAt.toISOString(),
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
        resumed: false,
      };
    });

    return NextResponse.json(result, {
      status: result.resumed ? 200 : 201,
    });
  } catch (error) {
    return handleApiError(error);
  }
}