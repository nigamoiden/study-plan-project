import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/require-user";
import { requireTeacherOrAdmin } from "@/server/assessment/permissions";
import { containsClientIdentityField } from "@/server/auth/identity-guard";

const revisionSchema = z.object({
  score: z.number().min(0).max(100).optional(),
  feedback: z.string().trim().min(1).max(10000),
  exerciseId: z.string().min(1).max(100).optional(),
}).strict();

export async function POST(request: NextRequest, context: { params: Promise<{ reviewId: string }> }) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
  }

  await requireTeacherOrAdmin(user.uid);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nội dung sửa bài không hợp lệ." }, { status: 400 });
  }

  if (containsClientIdentityField(body)) {
    return NextResponse.json(
      { error: "Không được gửi ID người dùng trong nội dung yêu cầu." },
      { status: 400 }
    );
  }

  const parsed = revisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nội dung sửa bài không hợp lệ." }, { status: 400 });
  }

  const { reviewId } = await context.params;
  const reviewRef = adminDb.collection("lessonGradingReviews").doc(reviewId);
  const reviewSnap = await reviewRef.get();
  if (!reviewSnap.exists) {
    return NextResponse.json({ error: "Không tìm thấy yêu cầu chấm bài." }, { status: 404 });
  }

  const review = reviewSnap.data()!;
  const profile = await adminDb.collection("users").doc(user.uid).get();
  if (profile.data()?.role !== "admin" && review.teacherId !== user.uid) {
    return NextResponse.json({ error: "Bạn không có quyền chỉnh sửa bài nộp này." }, { status: 403 });
  }

  const details = Array.isArray(review.details) ? review.details : [];
  const exerciseId = parsed.data.exerciseId;
  const revisedDetails = details.map((detail: Record<string, unknown>) => {
    if (exerciseId && detail.exerciseId !== exerciseId) return detail;
    return {
      ...detail,
      score: parsed.data.score ?? detail.score,
      feedback: parsed.data.feedback,
      teacherFeedback: parsed.data.feedback,
    };
  });
  const essayScores = revisedDetails
    .filter((detail: Record<string, unknown>) => detail.type === "essay")
    .map((detail: Record<string, unknown>) => Number(detail.score ?? 0));
  const finalScore = parsed.data.score ?? (
    essayScores.length
      ? Math.round(essayScores.reduce((sum, score) => sum + score, 0) / essayScores.length)
      : Number(review.aiScore ?? 0)
  );

  await reviewRef.update({
    status: "reviewed",
    finalScore,
    teacherFeedback: parsed.data.feedback,
    details: revisedDetails,
    reviewedBy: user.uid,
    reviewedAt: FieldValue.serverTimestamp(),
  });

  const submissionRef = adminDb
    .collection("users")
    .doc(review.studentId)
    .collection("lessonSubmissions")
    .doc(review.submissionId);
  await submissionRef.update({
    score: finalScore,
    status: "graded",
    details: revisedDetails,
    teacherFeedback: parsed.data.feedback,
    reviewedBy: user.uid,
    reviewedAt: FieldValue.serverTimestamp(),
  });

  await adminDb.collection("users").doc(review.studentId).collection("inbox").add({
    type: "graded_review",
    submissionId: review.submissionId,
    lessonId: review.lessonId,
    title: `Giáo viên đã chấm lại: ${review.lessonTitle}`,
    message: parsed.data.feedback,
    score: finalScore,
    status: "delivered",
    createdAt: FieldValue.serverTimestamp(),
    read: false,
  });

  return NextResponse.json({ success: true, score: finalScore });
}
