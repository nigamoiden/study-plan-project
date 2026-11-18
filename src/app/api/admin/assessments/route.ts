
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import {
  adminDb,
  handleApiError,
  HttpError,
  requireAssessmentUser,
} from "@/server/assessment/http";

const optionSchema = z.object({
  id: z.string().min(1).max(40),
  content: z.string().min(1).max(2000),
});

const questionSchema = z.object({
  id: z.string().min(1).max(100),
  subject: z.string().min(1).max(80),
  topic: z.string().min(1).max(120),

  type: z.enum([
    "multiple_choice",
    "true_false",
    "short_answer",
    "essay",
  ]),

  difficulty: z.enum([
    "easy",
    "medium",
    "hard",
  ]),

  content: z.string().min(1).max(20000),
  options: z.array(optionSchema).optional(),
  points: z.number().min(0).max(1000),
  imageUrl: z.string().url().optional(),
});

const answerKeySchema = z.object({
  questionId: z.string().min(1),
  correctOptionId: z.string().optional(),
  correctBoolean: z.boolean().optional(),
  acceptedAnswers: z.array(z.string()).optional(),
  explanation: z.string().max(5000).optional(),
});

const createAssessmentSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional(),
  subject: z.string().min(1).max(80),
  durationMinutes: z.number().int().min(1).max(600),
  passingScore: z.number().min(0).max(100).optional(),
  questions: z.array(questionSchema).min(1).max(200),
  answerKeys: z.array(answerKeySchema).min(1).max(200),
  publish: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAssessmentUser(request);

    const userSnapshot = await adminDb
      .collection("users")
      .doc(user.uid)
      .get();

    const role = userSnapshot.data()?.role;

    if (!["admin", "teacher"].includes(role)) {
      throw new HttpError(
        403,
        "Chỉ giáo viên hoặc quản trị viên được tạo đề."
      );
    }

    const body = await request.json().catch(() => null);

    const parsed = createAssessmentSchema.safeParse(body);

    if (!parsed.success) {
      throw new HttpError(
        400,
        parsed.error.issues[0]?.message ??
          "Dữ liệu đề thi không hợp lệ."
      );
    }

    const data = parsed.data;

    const questionIds = data.questions.map(
      (q) => q.id
    );

    const answerIds = data.answerKeys.map(
      (key) => key.questionId
    );

    if (
      new Set(questionIds).size !== questionIds.length
    ) {
      throw new HttpError(
        400,
        "ID câu hỏi không được trùng nhau."
      );
    }

    if (
      new Set(answerIds).size !== answerIds.length
    ) {
      throw new HttpError(
        400,
        "ID đáp án chuẩn không được trùng nhau."
      );
    }

    const questionById = new Map(
      data.questions.map((q) => [q.id, q])
    );

    for (const question of data.questions) {
      if (question.type === "multiple_choice") {
        if (
          !question.options ||
          question.options.length < 2
        ) {
          throw new HttpError(
            400,
            `Câu ${question.id} cần ít nhất 2 lựa chọn.`
          );
        }

        if (
          new Set(
            question.options.map((o) => o.id)
          ).size !== question.options.length
        ) {
          throw new HttpError(
            400,
            `Lựa chọn của câu ${question.id} bị trùng ID.`
          );
        }
      } else if (question.options?.length) {
        throw new HttpError(
          400,
          `Câu ${question.id} không cần danh sách lựa chọn.`
        );
      }
    }

    for (const key of data.answerKeys) {
      const question = questionById.get(
        key.questionId
      );

      if (!question) {
        throw new HttpError(
          400,
          `Không tìm thấy câu hỏi ${key.questionId}.`
        );
      }

      if (
        question.type === "multiple_choice" &&
        (
          !key.correctOptionId ||
          !question.options?.some(
            (option) =>
              option.id === key.correctOptionId
          )
        )
      ) {
        throw new HttpError(
          400,
          `Đáp án câu ${key.questionId} không hợp lệ.`
        );
      }

      if (
        question.type === "true_false" &&
        typeof key.correctBoolean !== "boolean"
      ) {
        throw new HttpError(
          400,
          `Câu ${key.questionId} cần correctBoolean.`
        );
      }

      if (
        question.type === "short_answer" &&
        (
          !key.acceptedAnswers ||
          key.acceptedAnswers.length === 0
        )
      ) {
        throw new HttpError(
          400,
          `Câu ${key.questionId} cần đáp án chấp nhận.`
        );
      }
    }

    if (
      answerIds.length !== questionIds.length ||
      questionIds.some((id) => !answerIds.includes(id))
    ) {
      throw new HttpError(
        400,
        "Mỗi câu hỏi phải có đúng một đáp án chuẩn."
      );
    }

    const assessmentRef = adminDb
      .collection("assessments")
      .doc();

    const answerKeyRef = adminDb
      .collection("assessmentAnswerKeys")
      .doc(assessmentRef.id);

    const batch = adminDb.batch();

    batch.create(assessmentRef, {
      title: data.title,
      description: data.description ?? "",
      subject: data.subject,
      durationMinutes: data.durationMinutes,
      passingScore: data.passingScore ?? null,
      questions: data.questions,
      status: data.publish ? "published" : "draft",
      createdBy: user.uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    batch.create(answerKeyRef, {
      answers: data.answerKeys,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: user.uid,
    });

    await batch.commit();

    return NextResponse.json(
      {
        success: true,
        assessmentId: assessmentRef.id,
        status: data.publish ? "published" : "draft",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
