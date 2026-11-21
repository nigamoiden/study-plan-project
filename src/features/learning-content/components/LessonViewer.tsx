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

const statementLabels = ["a", "b", "c", "d"];

function getTrueFalseAnswers(answer: string | undefined): Array<boolean | null> {
  if (!answer) return [];

  try {
    const parsed: unknown = JSON.parse(answer);
    if (
      Array.isArray(parsed) &&
      parsed.length === 4 &&
      parsed.every((value) => typeof value === "boolean" || value === null)
    ) {
      return parsed;
    }
  } catch {
    return [];
  }

  return [];
}

function ExerciseList({
  exercises,
  answerVisible,
  previewOnly,
}: {
  exercises: LessonExercise[];
  answerVisible: boolean;
  previewOnly: boolean;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitResult, setSubmitResult] = useState<{
    score: number;
    status: string;
    details: Array<{ exerciseId: string; score: number; feedback: string }>;
  } | null>(null);

  async function submitExercises() {
    const missing = exercises.filter((exercise) => {
      const answer = answers[exercise.id];
      if (exercise.type === "true_false" && exercise.statements?.length === 4) {
        const statementAnswers = getTrueFalseAnswers(answer);
        return (
          statementAnswers.length !== 4 ||
          statementAnswers.some((item) => item === null)
        );
      }
      return answer === undefined || answer.trim().length === 0;
    });
    if (missing.length > 0) {
      setSubmitError(`Còn ${missing.length} câu chưa trả lời.`);
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch(`${window.location.pathname}/submit`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: exercises.map((exercise) => ({
            exerciseId: exercise.id,
            answer: answers[exercise.id] ?? "",
          })),
        }),
      });
      const responseText = await response.text();
      let data: {
        result?: typeof submitResult;
        error?: string;
      };
      try {
        data = JSON.parse(responseText) as typeof data;
      } catch {
        throw new Error(
          responseText.trim()
            ? "Máy chủ trả về dữ liệu không hợp lệ khi nộp bài."
            : "Máy chủ chưa trả về kết quả. Vui lòng thử lại."
        );
      }

      if (!response.ok || !data.result) {
        throw new Error(data.error ?? "Không thể nộp bài tập.");
      }
      setSubmitResult(data.result);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Không thể nộp bài tập.");
    } finally {
      setSubmitting(false);
    }
  }

  function isCorrect(exercise: LessonExercise) {
    const answer = answers[exercise.id];
    if (answer === undefined) return false;

    if (exercise.type === "true_false" && exercise.statements?.length === 4) {
      const statementAnswers = getTrueFalseAnswers(answer);
      return (
        statementAnswers.length === 4 &&
        exercise.statements.every(
          (statement, index) =>
            statementAnswers[index] === statement.correctAnswer
        )
      );
    }

    if (!exercise.correctAnswer) return false;

    if (exercise.type === "short_answer") {
      return answer.trim().toLocaleLowerCase() ===
        exercise.correctAnswer?.trim().toLocaleLowerCase();
    }

    return answer === exercise.correctAnswer;
  }

  return (
    <section id="bai-tap" className="mt-10 space-y-5">
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
                    disabled={previewOnly}
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

          {exercise.type === "true_false" &&
            exercise.statements?.length === 4 && (
            <div className="mt-4 space-y-3">
              {exercise.statements.map((statement, statementIndex) => {
                const statementAnswers = getTrueFalseAnswers(
                  answers[exercise.id]
                );
                const selectedValue = statementAnswers[statementIndex] ?? null;

                return (
                  <div
                    key={`${exercise.id}-${statementIndex}`}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                  >
                    <p className="flex-1 text-sm">
                      <span className="mr-2 font-semibold">
                        {statementLabels[statementIndex]}.
                      </span>
                      {statement.content}
                    </p>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={selectedValue === true}
                      aria-label={`Ý ${statementLabels[statementIndex]}: ${
                        selectedValue === null
                          ? "chưa chọn"
                          : selectedValue
                            ? "Đúng"
                            : "Sai"
                      }`}
                      disabled={previewOnly}
                      onClick={() => {
                        const nextAnswers =
                          statementAnswers.length === 4
                            ? [...statementAnswers]
                            : [null, null, null, null];
                        nextAnswers[statementIndex] =
                          selectedValue === null ? true : !selectedValue;
                        setAnswers((current) => ({
                          ...current,
                          [exercise.id]: JSON.stringify(nextAnswers),
                        }));
                      }}
                      className="flex shrink-0 items-center gap-2 self-end rounded-full p-1 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
                    >
                      <span>
                        {selectedValue === null
                          ? "Chưa chọn"
                          : selectedValue
                            ? "Đúng"
                            : "Sai"}
                      </span>
                      <span
                        className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
                          selectedValue === true
                            ? "bg-violet-600"
                            : selectedValue === false
                              ? "bg-slate-500"
                              : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`h-4 w-4 rounded-full bg-white transition-transform ${
                            selectedValue === true ? "translate-x-5" : ""
                          }`}
                        />
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {exercise.type === "true_false" &&
            (!exercise.statements || exercise.statements.length !== 4) && (
            <div className="mt-3 flex gap-2">
              {[
                { value: "true", label: "Đúng" },
                { value: "false", label: "Sai" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={previewOnly}
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

          {!previewOnly &&
            (exercise.type === "short_answer" ||
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

          {answerVisible && (
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
          )}

          {answerVisible && revealed[exercise.id] && (
            <div className="mt-4 rounded-lg bg-violet-50 p-4 text-sm">
              <p>
                <strong>Đáp án:</strong>{" "}
                {exercise.type === "multiple_choice"
                  ? exercise.options?.[Number(exercise.correctAnswer)]
                  : exercise.type === "true_false"
                    ? exercise.statements?.length === 4
                      ? exercise.statements
                          .map(
                            (statement, statementIndex) =>
                              `${statementLabels[statementIndex]}. ${
                                statement.correctAnswer ? "Đúng" : "Sai"
                              }`
                          )
                          .join(" · ")
                      : exercise.correctAnswer === "true"
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

      {!previewOnly && exercises.length > 0 && (
        <>
          {submitError && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {submitError}
            </p>
          )}

          <div className="flex flex-col gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-slate-900">Nộp bài luyện tập</p>
              <p className="mt-1 text-sm text-slate-600">
                Câu tự luận sẽ được AI chấm sơ bộ rồi gửi cho giáo viên xác nhận.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void submitExercises()}
              disabled={submitting}
              className="rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Đang chấm..." : "Nộp bài"}
            </button>
          </div>

          {submitResult && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm font-semibold text-emerald-700">
                {submitResult.status === "pending_teacher_review"
                  ? "Đang chờ giáo viên xác nhận"
                  : "Đã chấm xong"}
              </p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {submitResult.score}%
              </p>
              <div className="mt-4 space-y-2">
                {submitResult.details.map((detail, index) => (
                  <div
                    key={detail.exerciseId}
                    className="rounded-lg bg-white p-3 text-sm"
                  >
                    <p className="font-semibold">
                      Câu {index + 1}: {detail.score}%
                    </p>
                    <p className="mt-1 text-slate-600">{detail.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default function LessonViewer({
  lessonId,
  previewOnly = false,
}: {
  lessonId: string;
  previewOnly?: boolean;
}) {
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

      <ExerciseList
        exercises={lesson.exercises}
        answerVisible={lesson.answerVisible !== false}
        previewOnly={previewOnly}
      />
    </main>
  );
}