import { NextRequest, NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase/admin";
import type { Lesson } from "@/features/learning-content/types/content.types";
import { requireUser } from "@/server/auth/require-user";

type RouteContext = {
  params: Promise<{ lessonId: string }>;
};

function toIsoString(value: unknown): string | null {
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate().toISOString();
  }

  return null;
}

function serializeLesson(
  id: string,
  data: FirebaseFirestore.DocumentData
): Lesson {
  return {
    id,
    title: data.title,
    description: data.description ?? "",
    subject: data.subject,
    topic: data.topic,
    blocks: data.blocks,
    exercises: data.exercises,
    createdBy: data.createdBy,
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
}

export async function GET(_: NextRequest, context: RouteContext) {
  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
  }

  const { lessonId } = await context.params;

  try {
    const [lessonSnapshot, profileSnapshot] = await Promise.all([
      adminDb.collection("lessons").doc(lessonId).get(),
      adminDb.collection("users").doc(user.uid).get(),
    ]);

    if (!lessonSnapshot.exists) {
      return NextResponse.json({ error: "Không tìm thấy bài học." }, { status: 404 });
    }

    if (!profileSnapshot.exists) {
      return NextResponse.json({ error: "Không tìm thấy hồ sơ." }, { status: 404 });
    }

    const lessonData = lessonSnapshot.data()!;
    const profile = profileSnapshot.data()!;
    const role = profile.role ?? "student";
    const canRead =
      role === "admin" ||
      (role === "teacher" && lessonData.createdBy === user.uid) ||
      (role === "student" &&
        lessonData.status === "published" &&
        Array.isArray(profile.focusSubjects) &&
        profile.focusSubjects.includes(lessonData.subject));

    if (!canRead) {
      return NextResponse.json({ error: "Không có quyền truy cập bài học này." }, { status: 403 });
    }

    return NextResponse.json({ lesson: serializeLesson(lessonSnapshot.id, lessonData) });
  } catch (error) {
    console.error("Get lesson error:", error);
    return NextResponse.json(
      { error: "Không thể tải bài học." },
      { status: 500 }
    );
  }
}
