import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/require-user";
import { requireAdmin } from "@/server/assessment/permissions";
import { handleApiError } from "@/server/assessment/http";

const questionSchema = z.object({
  subject: z.enum(["math", "physics", "chemistry", "biology", "english", "literature", "history"]),
  question: z.string().trim().min(5).max(1000),
  options: z.array(z.string().trim().min(1).max(500)).min(2).max(8),
  correctAnswer: z.number().int().min(0),
  active: z.boolean().default(true),
}).refine((value) => value.correctAnswer < value.options.length, {
  message: "Đáp án đúng không nằm trong danh sách lựa chọn.",
});

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
    await requireAdmin(user.uid);

    const snapshot = await adminDb
      .collection("onboardingQuestions")
      .limit(200)
      .get();

    return NextResponse.json({
      questions: snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
    await requireAdmin(user.uid);

    const parsed = questionSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Câu hỏi không hợp lệ." },
        { status: 400 }
      );
    }

    const ref = adminDb.collection("onboardingQuestions").doc();
    await ref.create({
      ...parsed.data,
      createdBy: user.uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: ref.id }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
