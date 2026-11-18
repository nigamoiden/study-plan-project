"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import { SUBJECT_LABELS } from "../constants";
import type { Lesson } from "../types/content.types";
import { listLessons } from "../services/lesson.service";
import SubjectPreferencesForm from "./SubjectPreferencesForm";

type LibraryResult = {
  key: string;
  lessons: Lesson[];
  focusSubjects: Lesson["subject"][];
  error: string;
};

export default function LessonLibrary() {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [result, setResult] = useState<LibraryResult | null>(null);
  const requestKey = `${selectedSubject}|${topicFilter}|${refreshKey}`;

  useEffect(() => {
    let active = true;

    listLessons({
      subject: selectedSubject || undefined,
      topic: topicFilter || undefined,
    })
      .then((response) => {
        if (!active) return;
        setResult({
          key: requestKey,
          lessons: response.lessons,
          focusSubjects: response.focusSubjects,
          error: "",
        });
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setResult({
          key: requestKey,
          lessons: [],
          focusSubjects: [],
          error:
            loadError instanceof Error
              ? loadError.message
              : "Không thể tải bài học.",
        });
      });

    return () => {
      active = false;
    };
  }, [requestKey, selectedSubject, topicFilter]);

  const currentResult = result?.key === requestKey ? result : null;
  const lessons = currentResult?.lessons ?? [];
  const focusSubjects = currentResult?.focusSubjects ?? [];
  const loading = currentResult === null;
  const error = currentResult?.error ?? "";

  function searchTopic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTopicFilter(topicInput.trim());
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">
          Học liệu
        </p>
        <h1 className="mt-1 text-3xl font-bold">Thư viện bài học</h1>
      </header>

      <SubjectPreferencesForm
        key={String(result !== null)}
        focusSubjects={focusSubjects}
        onSaved={() => {
          setSelectedSubject("");
          setRefreshKey((value) => value + 1);
        }}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <label className="text-sm font-medium">
          Lọc theo môn
          <select
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 sm:min-w-48"
            value={selectedSubject}
            onChange={(event) => setSelectedSubject(event.target.value)}
          >
            <option value="">Tất cả môn đã chọn</option>
            {focusSubjects.map((subject) => (
              <option key={subject} value={subject}>
                {SUBJECT_LABELS[subject]}
              </option>
            ))}
          </select>
        </label>

        <form onSubmit={searchTopic} className="flex flex-1 items-end gap-2">
          <label className="flex-1 text-sm font-medium">
            Tìm theo chủ đề
            <input
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2"
              value={topicInput}
              onChange={(event) => setTopicInput(event.target.value)}
              placeholder="Ví dụ: Phương trình"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg border border-slate-300 px-4 py-2 font-semibold"
          >
            Lọc
          </button>
        </form>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </p>
      )}
      {loading && <p className="text-slate-600">Đang tải bài học...</p>}
      {!loading && !error && lessons.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          {focusSubjects.length === 0
            ? "Hãy chọn ít nhất một môn để xem bài học."
            : "Chưa có bài học phù hợp với môn và chủ đề đã chọn."}
        </div>
      )}
      {!loading && !error && lessons.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <article
              key={lesson.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-violet-700">
                {SUBJECT_LABELS[lesson.subject]} · {lesson.topic}
              </p>
              <h2 className="mt-2 text-xl font-bold">{lesson.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                {lesson.description || "Mở bài học để xem nội dung và bài tập."}
              </p>
              <Link
                href={`/lessons/${encodeURIComponent(lesson.id)}`}
                className="mt-4 inline-flex font-semibold text-violet-700 hover:underline"
              >
                Mở bài học
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
