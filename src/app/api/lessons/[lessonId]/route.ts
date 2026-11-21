import { NextRequest, NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase/admin";
import type {
  Lesson,
  LessonExercise,
  ExerciseType,
} from "@/features/learning-content/types/content.types";
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
  data: FirebaseFirestore.DocumentData,
  includeAnswers: boolean
): Lesson {
  const exercises: LessonExercise[] = Array.isArray(data.exercises)
    ? data.exercises.map((exercise: Record<string, unknown>) => {
        const id = String(exercise.id ?? "");
        const type = String(exercise.type) as ExerciseType;
        const prompt = String(exercise.prompt ?? "");
        const options = Array.isArray(exercise.options)
          ? exercise.options.map(String)
          : undefined;
        const statements = Array.isArray(exercise.statements)
          ? exercise.statements.map((statement: Record<string, unknown>) => ({
              content: String(statement.content ?? ""),
              ...(includeAnswers && typeof statement.correctAnswer === "boolean"
                ? { correctAnswer: statement.correctAnswer }
                : {}),
            }))
          : undefined;
        const publicExercise = {
          id,
          type,
          prompt,
          options,
          statements,
        };
        return includeAnswers
          ? {
              ...publicExercise,
              correctAnswer: typeof exercise.correctAnswer === "string"
                ? exercise.correctAnswer
                : "",
              explanation: typeof exercise.explanation === "string"
                ? exercise.explanation
                : "",
            }
          : publicExercise;
      })
    : [];

  return {
    id,
    title: data.title,
    description: data.description ?? "",
    subject: data.subject,
    topic: data.topic,
    blocks: data.blocks,
    exercises,
    answerVisible: includeAnswers,
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

    return NextResponse.json({
      lesson: serializeLesson(
        lessonSnapshot.id,
        lessonData,
        role !== "student"
      ),
    });
  } catch (error) {
    console.error("Get lesson error:", error);
    return NextResponse.json(
      { error: "Không thể tải bài học." },
      { status: 500 }
    );
  }
}
