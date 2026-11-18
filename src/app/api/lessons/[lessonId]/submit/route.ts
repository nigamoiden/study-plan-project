import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/require-user";
import { gradeWithAI, isAIGradingConfigured } from "@/server/grading/ai-grader";

const submitSchema = z.object({
  answers: z.array(z.object({
    exerciseId: z.string().min(1).max(100),
    answer: z.string().trim().max(10000),
  })).min(1).max(100),
});

export async function POST(request: NextRequest, context: { params: Promise<{ lessonId: string }> }) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Origin không hợp lệ." }, { status: 403 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
  }

  const parsed = submitSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Danh sách câu trả lời không hợp lệ." }, { status: 400 });
  }

  const { lessonId } = await context.params;
  const [lessonSnap, profileSnap] = await Promise.all([
    adminDb.collection("lessons").doc(lessonId).get(),
    adminDb.collection("users").doc(user.uid).get(),
  ]);

  if (!lessonSnap.exists) {
    return NextResponse.json({ error: "Không tìm thấy bài học." }, { status: 404 });
  }

  const lesson = lessonSnap.data()!;
  const profile = profileSnap.data() ?? {};
  if (
    lesson.status !== "published" ||
    (
      (profile.role ?? "student") !== "admin" &&
      !((profile.focusSubjects ?? []) as string[]).includes(lesson.subject)
    )
  ) {
    return NextResponse.json({ error: "Không có quyền nộp bài cho bài học này." }, { status: 403 });
  }

  const exercises = Array.from(lesson.exercises ?? []) as Array<{
    id: string;
    type: "multiple_choice" | "true_false" | "short_answer" | "essay";
    prompt: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
  }>;
  const answerMap = new Map(parsed.data.answers.map((item) => [item.exerciseId, item.answer]));
  if (
    parsed.data.answers.length !== exercises.length ||
    parsed.data.answers.length !== new Set(parsed.data.answers.map((item) => item.exerciseId)).size ||
    parsed.data.answers.some((item) => !exercises.some((exercise) => exercise.id === item.exerciseId))
  ) {
    return NextResponse.json({ error: "Câu trả lời không thuộc bài học hoặc bị trùng." }, { status: 400 });
  }

  const theory = Array.isArray(lesson.blocks)
    ? lesson.blocks
        .filter((block: { type?: string }) => block.type === "theory")
        .map((block: { text?: string }) => block.text ?? "")
        .join("\n")
    : "";

  let hasEssay = false;
  let totalScore = 0;
  const details = [];

  for (const exercise of exercises) {
    const answer = answerMap.get(exercise.id) ?? "";
    let score = 0;
    let feedback = "";

    if (exercise.type === "multiple_choice") {
      const correctIndex = Number(exercise.correctAnswer);
      score = answer === String(correctIndex) ? 100 : 0;
      feedback = score === 100 ? "Chính xác." : `Đáp án đúng: ${exercise.options?.[correctIndex] ?? exercise.correctAnswer}`;
    } else if (exercise.type === "true_false") {
      score = answer === exercise.correctAnswer ? 100 : 0;
      feedback = score === 100 ? "Chính xác." : `Đáp án đúng: ${exercise.correctAnswer === "true" ? "Đúng" : "Sai"}`;
    } else if (exercise.type === "short_answer") {
      const normalizedAnswer = answer.normalize("NFC").trim().toLocaleLowerCase("vi-VN");
      const normalizedCorrect = exercise.correctAnswer.normalize("NFC").trim().toLocaleLowerCase("vi-VN");
      score = normalizedAnswer.length > 0 && normalizedAnswer === normalizedCorrect ? 100 : 0;
      feedback = score === 100 ? "Câu trả lời chính xác." : `Đáp án mẫu: ${exercise.correctAnswer}`;
    } else {
      hasEssay = true;
      const aiResult = await gradeWithAI({
        prompt: exercise.prompt,
        answer,
        rubric: [
          `Kiến thức bài học: ${theory}`,
          `Đáp án/ý chính mẫu: ${exercise.correctAnswer}`,
          `Giải thích: ${exercise.explanation}`,
        ],
        maxScore: 100,
      });
      score = aiResult?.score ?? 0;
      feedback = aiResult?.feedback ?? "Câu tự luận đang chờ giáo viên hoặc AI chấm lại.";
    }

    totalScore += score;
    details.push({
      exerciseId: exercise.id,
      type: exercise.type,
      answer,
      score,
      feedback,
      explanation: exercise.explanation,
      correctAnswer: exercise.type === "essay" ? null : exercise.correctAnswer,
    });
  }

  const score = exercises.length
    ? Math.round(totalScore / exercises.length)
    : 0;
  const now = new Date();
  const submissionRef = adminDb
    .collection("users")
    .doc(user.uid)
    .collection("lessonSubmissions")
    .doc();

  await submissionRef.set({
    lessonId,
    lessonTitle: lesson.title,
    subject: lesson.subject,
    teacherId: lesson.createdBy,
    score,
    status: hasEssay ? "pending_teacher_review" : "graded",
    aiGradingConfigured: isAIGradingConfigured(),
    details,
    submittedAt: now,
    createdAt: FieldValue.serverTimestamp(),
  });

  await adminDb.collection("users").doc(user.uid).collection("inbox").add({
    type: "lesson_result",
    submissionId: submissionRef.id,
    lessonId,
    title: hasEssay ? "Bài làm đã chờ giáo viên xem xét" : "Kết quả bài luyện tập",
    message: hasEssay
      ? `AI đã chấm sơ bộ bài “${lesson.title}” đạt ${score}%. Giáo viên sẽ xác nhận hoặc chỉnh sửa.`
      : `Bạn đã hoàn thành bài “${lesson.title}” và đạt ${score}%.`,
    score,
    status: hasEssay ? "pending_review" : "delivered",
    createdAt: FieldValue.serverTimestamp(),
    read: false,
  });

  if (hasEssay) {
    await adminDb.collection("lessonGradingReviews").add({
      submissionId: submissionRef.id,
      studentId: user.uid,
      studentName: profile.name ?? profile.displayName ?? user.email ?? "Học sinh",
      lessonId,
      lessonTitle: lesson.title,
      subject: lesson.subject,
      teacherId: lesson.createdBy,
      aiScore: score,
      status: "pending_review",
      details,
      submittedAt: now,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  return NextResponse.json({
    success: true,
    submissionId: submissionRef.id,
    result: {
      score,
      status: hasEssay ? "pending_teacher_review" : "graded",
      details,
    },
  });
}
