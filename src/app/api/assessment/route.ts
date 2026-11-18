import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import {
  adminDb,
  handleApiError,
  requireAssessmentUser,
  HttpError,
} from "@/server/assessment/http";
import { requireTeacherOrAdmin } from "@/server/assessment/permissions";
import { createAssessmentSchema } from "@/features/assessment/schemas/question.schema";

export async function GET(request: NextRequest) {
  try {
    await requireAssessmentUser(request);
    const subject = request.nextUrl.searchParams.get("subject");

    let query = adminDb
      .collection("assessments")
      .where("status", "==", "published");

    if (subject) {
      query = query.where("subject", "==", subject) as typeof query;
    }

    const snapshot = await query.limit(50).get();

    const assessments = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        title: data.title,
        description: data.description ?? "",
        subject: data.subject,
        durationMinutes: data.durationMinutes,
        passingScore: data.passingScore,
        totalPoints: data.totalPoints,
        maxAttempts: data.maxAttempts,
        createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
      };
    });

    return NextResponse.json({ assessments });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAssessmentUser(request);
    await requireTeacherOrAdmin(user.uid);

    const body = await request.json();
    const parsed = createAssessmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu đề thi không hợp lệ.",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const questionIds = input.questions.map((q) => q.id);

    if (new Set(questionIds).size !== questionIds.length) {
      throw new HttpError(400, "ID câu hỏi bị trùng.");
    }

    const totalPoints = input.questions.reduce(
      (sum, question) => sum + question.points,
      0
    );

    const assessmentRef = adminDb.collection("assessments").doc();
    const answerKeyRef = adminDb
      .collection("assessmentAnswerKeys")
      .doc(assessmentRef.id);

    const batch = adminDb.batch();

    batch.set(assessmentRef, {
      title: input.title,
      description: input.description ?? "",
      subject: input.subject,
      durationMinutes: input.durationMinutes,
      passingScore: input.passingScore,
      maxAttempts: input.maxAttempts,
      totalPoints,
      questions: input.questions,
      status: "draft",
      createdBy: user.uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    batch.set(answerKeyRef, {
        assessmentId: assessmentRef.id,
        answerKeys: input.answerKeys,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        });

    await batch.commit();

    return NextResponse.json(
      {
        success: true,
        assessmentId: assessmentRef.id,
        status: "draft",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}