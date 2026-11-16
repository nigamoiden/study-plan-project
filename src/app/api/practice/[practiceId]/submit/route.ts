import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase/admin";
import { getPracticeItemById } from "@/server/practice/catalog";
import { requireUser } from "@/server/auth/require-user";
import { gradePracticeAttempt } from "@/server/practice/grader";

type Context = {
  params: Promise<{ practiceId: string }>;
};

const submitPracticeSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      answer: z.union([
        z.string().max(10000),
        z.boolean(),
        z.number(),
        z.null(),
      ]),
    })
  ).max(50),
});

export async function POST(request: Request, context: Context) {
  const user = await requireUser();

  if (!user) {
    return NextResponse.json(
      { error: "Phiên đăng nhập đã hết hạn." },
      { status: 401 }
    );
  }

  const { practiceId } = await context.params;
  const practice = getPracticeItemById(practiceId);

  if (!practice) {
    return NextResponse.json(
      { error: "Không tìm thấy bài luyện tập." },
      { status: 404 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const parsed = submitPracticeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Dữ liệu bài làm không hợp lệ.",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const submittedQuestionIds = parsed.data.answers.map(
    (answer) => answer.questionId
  );
  const questionIds = new Set(practice.questions.map((question) => question.id));

  if (
    new Set(submittedQuestionIds).size !== submittedQuestionIds.length ||
    submittedQuestionIds.some((questionId) => !questionIds.has(questionId))
  ) {
    return NextResponse.json(
      { error: "Câu trả lời chứa câu hỏi không hợp lệ hoặc bị lặp." },
      { status: 400 }
    );
  }

  const result = await gradePracticeAttempt(practice, parsed.data.answers);

  await adminDb
    .collection("users")
    .doc(user.uid)
    .collection("practiceAttempts")
    .add({
      practiceId,
      practiceTitle: practice.title,
      subject: practice.subject,
      score: result.score,
      passed: result.passed,
      details: result.details,
      submittedAt: FieldValue.serverTimestamp(),
    });

  return NextResponse.json({
    success: true,
    result,
  });
}
