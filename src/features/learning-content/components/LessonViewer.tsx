"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { isAllowedSimulationUrl, SUBJECT_LABELS } from "../constants";
import type {
  Lesson,
  LessonExercise,
} from "../types/content.types";
import { getLesson } from "../services/lesson.service";
import { SketchDrawing } from "./SketchEditor";

function ExerciseList({ exercises }: { exercises: LessonExercise[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  function isCorrect(exercise: LessonExercise) {
    const answer = answers[exercise.id];
    if (answer === undefined) return false;

    if (exercise.type === "short_answer") {
      return answer.trim().toLocaleLowerCase() ===
        exercise.correctAnswer.trim().toLocaleLowerCase();
    }

    return answer === exercise.correctAnswer;
  }

  return (
    <section className="mt-10 space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Bài tập</h2>
        <p className="mt-1 text-sm text-slate-500">
          Sau khi trả lời, mở phần đáp án để xem giải thích.
        </p>
      </div>

      {exercises.map((exercise, index) => (
        <article
          key={exercise.id}
          className="rounded-2xl border border-slate-200 bg-white p-5"
        >
          <p className="mb-1 text-xs font-semibold uppercase text-violet-700">
            Câu {index + 1} ·{" "}
            {exercise.type === "multiple_choice"
              ? "Trắc nghiệm"
              : exercise.type === "true_false"
                ? "Đúng / Sai"
                : exercise.type === "short_answer"
                  ? "Trả lời ngắn"
                  : "Tự luận"}
          </p>
          <h3 className="font-semibold">{exercise.prompt}</h3>

          {exercise.type === "multiple_choice" && (
            <div className="mt-3 space-y-2">
              {(exercise.options ?? []).map((option, optionIndex) => (
                <label
                  key={`${exercise.id}-${optionIndex}`}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-3"
                >
                  <input
                    type="radio"
                    name={exercise.id}
                    checked={answers[exercise.id] === String(optionIndex)}
                    onChange={() =>
                      setAnswers((current) => ({
                        ...current,
                        [exercise.id]: String(optionIndex),
                      }))
                    }
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}

          {exercise.type === "true_false" && (
            <div className="mt-3 flex gap-2">
              {[
                { value: "true", label: "Đúng" },
                { value: "false", label: "Sai" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={answers[exercise.id] === option.value}
                  onClick={() =>
                    setAnswers((current) => ({
                      ...current,
                      [exercise.id]: option.value,
                    }))
                  }
                  className={`rounded-lg border px-4 py-2 ${
                    answers[exercise.id] === option.value
                      ? "border-violet-600 bg-violet-50"
                      : "border-slate-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {(exercise.type === "short_answer" ||
            exercise.type === "essay") && (
            <textarea
              className="mt-3 w-full rounded-lg border border-slate-300 p-3"
              rows={exercise.type === "essay" ? 5 : 2}
              value={answers[exercise.id] ?? ""}
              onChange={(event) =>
                setAnswers((current) => ({
                  ...current,
                  [exercise.id]: event.target.value,
                }))
              }
              placeholder={
                exercise.type === "essay"
                  ? "Nhập câu trả lời của bạn..."
                  : "Nhập câu trả lời ngắn..."
              }
            />
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setRevealed((current) => ({
                  ...current,
                  [exercise.id]: !current[exercise.id],
                }))
              }
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
            >
              {revealed[exercise.id] ? "Ẩn đáp án" : "Xem đáp án và giải thích"}
            </button>
            {exercise.type !== "essay" &&
              answers[exercise.id] !== undefined &&
              revealed[exercise.id] && (
                <span
                  className={
                    isCorrect(exercise) ? "text-emerald-700" : "text-amber-700"
                  }
                >
                  {isCorrect(exercise)
                    ? "Chính xác."
                    : "Chưa chính xác, hãy xem phần giải thích."}
                </span>
              )}
          </div>

          {revealed[exercise.id] && (
            <div className="mt-4 rounded-lg bg-violet-50 p-4 text-sm">
              <p>
                <strong>Đáp án:</strong>{" "}
                {exercise.type === "multiple_choice"
                  ? exercise.options?.[Number(exercise.correctAnswer)]
                  : exercise.type === "true_false"
                    ? exercise.correctAnswer === "true"
                      ? "Đúng"
                      : "Sai"
                    : exercise.correctAnswer}
              </p>
              <p className="mt-2 whitespace-pre-wrap">
                <strong>Giải thích:</strong> {exercise.explanation}
              </p>
            </div>
          )}
        </article>
      ))}
    </section>
  );
}

export default function LessonViewer({ lessonId }: { lessonId: string }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getLesson(lessonId)
      .then((result) => {
        if (active) setLesson(result);
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
  }, [lessonId]);

  if (loading) {
    return <p className="mx-auto max-w-4xl px-4 py-10">Đang tải bài học...</p>;
  }

  if (error || !lesson) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
          {error || "Không tìm thấy bài học."}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="rounded-2xl bg-violet-950 p-6 text-white sm:p-8">
        <p className="text-sm font-semibold text-violet-200">
          {SUBJECT_LABELS[lesson.subject]} · {lesson.topic}
        </p>
        <h1 className="mt-2 text-3xl font-bold">{lesson.title}</h1>
        {lesson.description && (
          <p className="mt-3 whitespace-pre-wrap text-violet-100">
            {lesson.description}
          </p>
        )}
      </header>

      <div className="mt-6 space-y-6">
        {lesson.blocks.map((block, index) => (
          <section
            key={`${block.type}-${index}`}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            {block.type === "theory" && (
              <p className="whitespace-pre-wrap leading-8 text-slate-800">
                {block.text}
              </p>
            )}

            {block.type === "image" && (
              <figure>
                <Image
                  src={block.url}
                  alt={block.alt}
                  width={1280}
                  height={720}
                  unoptimized
                  className="h-auto max-h-[36rem] w-full rounded-lg object-contain"
                />
                <figcaption className="mt-2 text-center text-sm text-slate-500">
                  {block.alt}
                </figcaption>
              </figure>
            )}

            {block.type === "sketch" && (
              <>
                <h2 className="mb-3 text-lg font-semibold">{block.title}</h2>
                <SketchDrawing shapes={block.shapes} />
              </>
            )}

            {block.type === "simulation" && (
              <>
                <h2 className="mb-3 text-lg font-semibold">{block.title}</h2>
                {isAllowedSimulationUrl(block.url) ? (
                  <iframe
                    src={block.url}
                    title={block.title}
                    sandbox="allow-scripts allow-same-origin"
                    allow="fullscreen"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="aspect-video w-full rounded-lg border border-slate-200"
                  />
                ) : (
                  <p className="text-sm text-red-700">
                    Địa chỉ mô phỏng không được hỗ trợ.
                  </p>
                )}
              </>
            )}
          </section>
        ))}
      </div>

      <ExerciseList exercises={lesson.exercises} />
    </main>
  );
}