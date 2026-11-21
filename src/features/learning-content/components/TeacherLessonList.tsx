"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SUBJECT_LABELS } from "../constants";
import type { Lesson } from "../types/content.types";
import { listLessons } from "../services/lesson.service";

export default function TeacherLessonList() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listLessons()
      .then(({ lessons: result }) => {
        if (active) setLessons(result);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Không thể tải bài học."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">
            Khu vực giáo viên
          </p>
          <h1 className="mt-1 text-3xl font-bold">Bài học của tôi</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/teacher/lesson-reviews"
            className="rounded-xl border border-violet-300 bg-white px-5 py-3 font-semibold text-violet-700"
          >
            Bài chờ AI review
          </Link>
          <Link
            href="/teacher/lessons/new"
            className="rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white"
          >
            Soạn bài mới
          </Link>
        </div>
      </header>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </p>
      )}
      {loading && <p>Đang tải danh sách bài học...</p>}
      {!loading && !error && lessons.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          Bạn chưa đăng bài học nào.
        </p>
      )}
      {!loading && lessons.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {lessons.map((lesson) => (
            <article
              key={lesson.id}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <p className="text-sm font-semibold text-violet-700">
                {SUBJECT_LABELS[lesson.subject]} · {lesson.topic}
              </p>
              <h2 className="mt-2 text-xl font-bold">
                <Link
                  href={`/teacher/lessons/${encodeURIComponent(lesson.id)}`}
                  className="hover:text-violet-700"
                >
                  {lesson.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {lesson.exercises.length} câu hỏi · Đã đăng
              </p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
