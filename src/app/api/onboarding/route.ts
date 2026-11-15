
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { onboardingSchema } from "@/features/onboarding/schemas/onboarding.schema";

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

          // Lưu câu trả lời để backend chấm lại.
          // Không tin điểm số do trình duyệt gửi lên.
          diagnosticTest: {
            answers: data.diagnosticTest.answers,
            status:
              data.diagnosticTest.answers.length > 0
                ? "pending_server_grading"
                : "not_started",
          },

          completedAt: FieldValue.serverTimestamp(),
          version: 1,
        },

        onboardingCompleted: true,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

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
