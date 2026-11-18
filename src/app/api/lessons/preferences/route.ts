import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { focusSubjectsSchema } from "@/features/learning-content/schemas/content.schema";
import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/require-user";
import { containsClientIdentityField } from "@/server/auth/identity-guard";

export async function PATCH(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Origin không hợp lệ." }, { status: 403 });
  }

  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu yêu cầu không hợp lệ." }, { status: 400 });
  }

  if (containsClientIdentityField(body)) {
    return NextResponse.json(
      { error: "Không được gửi ID người dùng trong nội dung yêu cầu." },
      { status: 400 }
    );
  }

  const parsed = focusSubjectsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Hãy chọn ít nhất một môn hợp lệ." },
      { status: 400 }
    );
  }

  try {
    const userRef = adminDb.collection("users").doc(user.uid);
    const profile = await userRef.get();

    if (!profile.exists) {
      return NextResponse.json({ error: "Không tìm thấy hồ sơ." }, { status: 404 });
    }

    if ((profile.data()?.role ?? "student") !== "student") {
      return NextResponse.json(
        { error: "Chỉ học sinh mới được cập nhật môn tập trung." },
        { status: 403 }
      );
    }

    await userRef.update({
      focusSubjects: parsed.data.focusSubjects,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      focusSubjects: parsed.data.focusSubjects,
    });
  } catch (error) {
    console.error("Update focus subjects error:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật môn học." },
      { status: 500 }
    );
  }
}
