import type {
  Lesson,
  LessonDraft,
} from "../types/content.types";

type LessonListResponse = {
  lessons: Lesson[];
  focusSubjects: Lesson["subject"][];
};

async function getErrorMessage(response: Response, fallback: string) {
  const result = (await response.json()) as { error?: string };
  return result.error || fallback;
}

export async function listLessons(filters: {
  subject?: string;
  topic?: string;
} = {}): Promise<LessonListResponse> {
  const search = new URLSearchParams();

  if (filters.subject) search.set("subject", filters.subject);
  if (filters.topic) search.set("topic", filters.topic);

  const suffix = search.size ? `?${search.toString()}` : "";
  const response = await fetch(`/api/lessons${suffix}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Không thể tải bài học."));
  }

  return (await response.json()) as LessonListResponse;
}

export async function getLesson(lessonId: string): Promise<Lesson> {
  const response = await fetch(
    `/api/lessons/${encodeURIComponent(lessonId)}`,
    { credentials: "same-origin" }
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Không thể tải bài học."));
  }

  const result = (await response.json()) as { lesson: Lesson };
  return result.lesson;
}

export async function publishLesson(lesson: LessonDraft): Promise<string> {
  const response = await fetch("/api/lessons", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lesson),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Không thể đăng bài học."));
  }

  const result = (await response.json()) as { lessonId: string };
  return result.lessonId;
}

export async function saveFocusSubjects(
  focusSubjects: Lesson["subject"][]
): Promise<void> {
  const response = await fetch("/api/lessons/preferences", {
    method: "PATCH",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ focusSubjects }),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Không thể cập nhật môn tập trung.")
    );
  }
}