
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { onboardingSchema } from "@/features/onboarding/schemas/onboarding.schema";
import { ensureStudyPlan } from "@/server/learning/study-plan";
import {
  gradeDiagnosticAnswers,
  InvalidDiagnosticAnswersError,
} from "@/server/onboarding/diagnostic";
import type { DiagnosticResult } from "@/features/onboarding/types/onboarding.types";
import { containsClientIdentityField } from "@/server/auth/identity-guard";

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");
    const expectedOrigin = new URL(request.url).origin;

    if (!origin || origin !== expectedOrigin) {
      return NextResponse.json(
        { error: "Yêu cầu không hợp lệ" },
        { status: 403 }
      );
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Bạn chưa đăng nhập" },
        { status: 401 }
      );
    }

    const decodedToken = await adminAuth.verifySessionCookie(
      sessionCookie,
      true
    );

    const body = await request.json();
    if (containsClientIdentityField(body)) {
      return NextResponse.json(
        { error: "Không được gửi ID người dùng trong nội dung yêu cầu." },
        { status: 400 }
      );
    }
    const validation = onboardingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dữ liệu không hợp lệ",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    let diagnosticResult: DiagnosticResult;

    try {
      diagnosticResult = await gradeDiagnosticAnswers(data.diagnosticTest.answers);
    } catch (error) {
      if (error instanceof InvalidDiagnosticAnswersError) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      throw error;
    }

    const userRef = adminDb
      .collection("users")
      .doc(decodedToken.uid);

    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      return NextResponse.json(
        { error: "Không tìm thấy hồ sơ người dùng" },
        { status: 404 }
      );
    }

    await userRef.set(
      {
        onboarding: {
          academicGoal: data.academicGoal,
          academicHistory: data.academicHistory,
          studyFrequency: data.studyFrequency,

          diagnosticTest: {
            ...diagnosticResult,
            status:
              diagnosticResult.answers.length > 0
                ? "graded"
                : "not_started",
          },

          completedAt: FieldValue.serverTimestamp(),
          version: 1,
        },

        onboardingCompleted: true,
        focusSubjects: data.focusSubjects,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await ensureStudyPlan(decodedToken.uid);

    return NextResponse.json({
      success: true,
      message: "Đã lưu hồ sơ học tập thành công",
    });
  } catch (error) {
    console.error("Save onboarding error:", error);

    return NextResponse.json(
      { error: "Không thể lưu hồ sơ học tập" },
      { status: 500 }
    );
  }
}
