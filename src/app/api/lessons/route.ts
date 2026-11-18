import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { lessonSchema } from "@/features/learning-content/schemas/content.schema";
import { isSubjectName } from "@/features/learning-content/constants";
import type {
  Lesson,
  LessonExercise,
  ExerciseType,
} from "@/features/learning-content/types/content.types";
import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/require-user";
import { requireTeacherOrAdmin } from "@/server/assessment/permissions";
import { HttpError } from "@/server/assessment/http";

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
        const publicExercise = {
          id,
          type,
          prompt,
          options,
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

export async function GET(request: NextRequest) {
  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
  }

  try {
    const profile = await adminDb.collection("users").doc(user.uid).get();
    const profileData = profile.data();

    if (!profileData) {
      return NextResponse.json(
        { error: "Không tìm thấy hồ sơ người dùng." },
        { status: 404 }
      );
    }

    const role = profileData.role ?? "student";
    const subjectFilter = request.nextUrl.searchParams.get("subject");
    const topicFilter = request.nextUrl.searchParams.get("topic")?.trim().toLowerCase();
    let query: FirebaseFirestore.Query = adminDb.collection("lessons");

    if (role === "student") {
      const focusSubjects = Array.isArray(profileData.focusSubjects)
        ? profileData.focusSubjects.filter(isSubjectName)
        : [];

      if (focusSubjects.length === 0) {
        return NextResponse.json({ lessons: [], focusSubjects: [] });
      }

      query = query.where("status", "==", "published");
      const snapshot = await query.limit(200).get();
      const lessons = snapshot.docs
        .filter((document) => {
          const subject = document.data().subject;
          return (
            focusSubjects.includes(subject) &&
            (!subjectFilter || subject === subjectFilter)
          );
        })
        .map((document) => serializeLesson(document.id, document.data(), role !== "student"))
        .filter((lesson) => {
          return (
            !topicFilter ||
            lesson.topic.toLowerCase().includes(topicFilter)
          );
        });

      return NextResponse.json({ lessons, focusSubjects });
    }

    if (role === "teacher") {
      query = query.where("createdBy", "==", user.uid);
    } else if (role !== "admin") {
      return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 403 });
    }

    const snapshot = await query.limit(200).get();
    const lessons = snapshot.docs
      .map((document) => serializeLesson(document.id, document.data(), true))
      .filter((lesson) => {
        return (
          (!subjectFilter || lesson.subject === subjectFilter) &&
          (!topicFilter || lesson.topic.toLowerCase().includes(topicFilter))
        );
      });

    return NextResponse.json({ lessons, focusSubjects: [] });
  } catch (error) {
    console.error("List lessons error:", error);
    return NextResponse.json(
      { error: "Không thể tải danh sách bài học." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (!origin || origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Origin không hợp lệ." }, { status: 403 });
  }

  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
  }

  try {
    await requireTeacherOrAdmin(user.uid);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Dữ liệu bài học không hợp lệ." },
        { status: 400 }
      );
    }

    const parsed = lessonSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Thông tin bài học không hợp lệ.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payloadSize = new TextEncoder().encode(
      JSON.stringify(parsed.data)
    ).length;

    if (payloadSize > 700_000) {
      return NextResponse.json(
        { error: "Nội dung bài học quá lớn. Hãy rút gọn hình phác họa hoặc văn bản." },
        { status: 413 }
      );
    }

    const lessonRef = adminDb.collection("lessons").doc();
    const now = FieldValue.serverTimestamp();

    await lessonRef.create({
      ...parsed.data,
      status: "published",
      createdBy: user.uid,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      { success: true, lessonId: lessonRef.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Publish lesson error:", error);
    return NextResponse.json(
      { error: "Không thể đăng bài học." },
      { status: 500 }
    );
  }
}
