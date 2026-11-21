"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  SUBJECT_OPTIONS,
} from "../constants";
import { lessonSchema } from "../schemas/content.schema";
import type {
  ExerciseType,
  LessonBlock,
  LessonDraft,
  LessonExercise,
} from "../types/content.types";
import { publishLesson } from "../services/lesson.service";
import SketchEditor from "./SketchEditor";

const fieldClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-violet-600";

function createExercise(type: ExerciseType = "multiple_choice"): LessonExercise {
  return {
    id: crypto.randomUUID(),
    type,
    prompt: "",
    ...(type === "multiple_choice"
      ? { options: ["", ""] }
      : {}),
    ...(type === "true_false"
      ? {
          statements: Array.from({ length: 4 }, () => ({
            content: "",
            correctAnswer: true,
          })),
        }
      : {}),
    correctAnswer: type === "true_false" ? "true" : "",
    explanation: "",
  };
}

const statementLabels = ["a", "b", "c", "d"];

const initialDraft: LessonDraft = {
  title: "",
  description: "",
  subject: "math",
  topic: "",
  blocks: [{ type: "theory", text: "" }],
  exercises: [
    {
      id: "initial-exercise",
      type: "multiple_choice",
      prompt: "",
      options: ["", ""],
      correctAnswer: "",
      explanation: "",
    },
  ],
};

export default function LessonEditor() {
  const router = useRouter();
  const [draft, setDraft] = useState<LessonDraft>(initialDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateBlock(index: number, block: LessonBlock) {
    setDraft((current) => ({
      ...current,
      blocks: current.blocks.map((item, itemIndex) =>
        itemIndex === index ? block : item
      ),
    }));
  }

  function addBlock(type: LessonBlock["type"]) {
    const block: LessonBlock =
      type === "theory"
        ? { type, text: "" }
        : type === "image"
          ? { type, url: "", alt: "" }
          : type === "sketch"
            ? { type, title: "", shapes: [] }
            : { type, title: "", url: "" };

    setDraft((current) => ({ ...current, blocks: [...current.blocks, block] }));
  }

  function updateExercise(index: number, exercise: LessonExercise) {
    setDraft((current) => ({
      ...current,
      exercises: current.exercises.map((item, itemIndex) =>
        itemIndex === index ? exercise : item
      ),
    }));
  }

  function changeExerciseType(index: number, type: ExerciseType) {
    setDraft((current) => ({
      ...current,
      exercises: current.exercises.map((exercise, itemIndex) =>
        itemIndex === index
          ? { ...createExercise(type), id: exercise.id }
          : exercise
      ),
    }));
  }

  function updateExerciseOption(
    exercise: LessonExercise,
    optionIndex: number,
    value: string
  ) {
    const options = [...(exercise.options ?? [])];
    options[optionIndex] = value;
    return { ...exercise, options };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const parsed = lessonSchema.safeParse(draft);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Vui lòng kiểm tra nội dung.");
      return;
    }

    setSaving(true);
    try {
      await publishLesson(parsed.data);
      router.replace("/teacher/lessons");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể đăng bài học."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <label className="text-sm font-semibold" htmlFor="lesson-title">
            Tên bài học
          </label>
          <input
            id="lesson-title"
            className={fieldClass}
            value={draft.title}
            maxLength={200}
            onChange={(event) =>
              setDraft({ ...draft, title: event.target.value })
            }
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="lesson-description">
            Mô tả
          </label>
          <textarea
            id="lesson-description"
            className={fieldClass}
            rows={2}
            maxLength={3000}
            value={draft.description}
            onChange={(event) =>
              setDraft({ ...draft, description: event.target.value })
            }
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold" htmlFor="lesson-subject">
              Môn học
            </label>
            <select
              id="lesson-subject"
              className={fieldClass}
              value={draft.subject}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  subject: event.target.value as LessonDraft["subject"],
                })
              }
            >
              {SUBJECT_OPTIONS.map((subject) => (
                <option key={subject.value} value={subject.value}>
                  {subject.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="lesson-topic">
              Chủ đề
            </label>
            <input
              id="lesson-topic"
              className={fieldClass}
              value={draft.topic}
              maxLength={120}
              onChange={(event) =>
                setDraft({ ...draft, topic: event.target.value })
              }
              placeholder="Ví dụ: Hình học không gian"
              required
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Nội dung bài học</h2>
          <p className="text-sm text-slate-500">
            Thêm lý thuyết, ảnh HTTPS, hình phác họa hoặc mô phỏng PhET/GeoGebra.
          </p>
        </div>

        {draft.blocks.map((block, index) => (
          <article
            key={`${block.type}-${index}`}
            className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {block.type === "theory"
                  ? "Lý thuyết"
                  : block.type === "image"
                    ? "Hình ảnh"
                    : block.type === "sketch"
                      ? "Phác họa"
                      : "Mô phỏng"}
              </h3>
              <button
                type="button"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    blocks: current.blocks.filter(
                      (_, itemIndex) => itemIndex !== index
                    ),
                  }))
                }
                className="text-sm text-red-600 hover:underline"
              >
                Xóa mục
              </button>
            </div>

            {block.type === "theory" && (
              <textarea
                className={fieldClass}
                rows={7}
                maxLength={30000}
                value={block.text}
                onChange={(event) =>
                  updateBlock(index, { ...block, text: event.target.value })
                }
                placeholder="Nhập nội dung lý thuyết..."
              />
            )}

            {block.type === "image" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  className={fieldClass}
                  type="url"
                  value={block.url}
                  onChange={(event) =>
                    updateBlock(index, { ...block, url: event.target.value })
                  }
                  placeholder="https://... (địa chỉ ảnh)"
                  aria-label="Địa chỉ ảnh"
                />
                <input
                  className={fieldClass}
                  value={block.alt}
                  onChange={(event) =>
                    updateBlock(index, { ...block, alt: event.target.value })
                  }
                  placeholder="Mô tả ảnh"
                  aria-label="Mô tả ảnh"
                />
              </div>
            )}

            {block.type === "sketch" && (
              <>
                <input
                  className={fieldClass}
                  value={block.title}
                  onChange={(event) =>
                    updateBlock(index, { ...block, title: event.target.value })
                  }
                  placeholder="Tiêu đề hình vẽ"
                  aria-label="Tiêu đề hình vẽ"
                />
                <SketchEditor
                  shapes={block.shapes}
                  onChange={(shapes) =>
                    updateBlock(index, { ...block, shapes })
                  }
                />
              </>
            )}

            {block.type === "simulation" && (
              <>
                <input
                  className={fieldClass}
                  value={block.title}
                  onChange={(event) =>
                    updateBlock(index, { ...block, title: event.target.value })
                  }
                  placeholder="Tên mô phỏng"
                  aria-label="Tên mô phỏng"
                />
                <input
                  className={fieldClass}
                  type="url"
                  value={block.url}
                  onChange={(event) =>
                    updateBlock(index, { ...block, url: event.target.value })
                  }
                  placeholder="URL mô phỏng từ phet.colorado.edu hoặc geogebra.org"
                  aria-label="Địa chỉ mô phỏng"
                />
              </>
            )}
          </article>
        ))}

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => addBlock("theory")} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">+ Lý thuyết</button>
          <button type="button" onClick={() => addBlock("image")} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">+ Hình ảnh</button>
          <button type="button" onClick={() => addBlock("sketch")} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">+ Công cụ phác họa</button>
          <button type="button" onClick={() => addBlock("simulation")} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">+ Mô phỏng</button>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Bài tập và lời giải</h2>
          <p className="text-sm text-slate-500">
            Mỗi câu cần có đáp án và phần giải thích.
          </p>
        </div>

        {draft.exercises.map((exercise, index) => (
          <article
            key={exercise.id}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-52 flex-1">
                <label className="text-sm font-semibold">Dạng bài</label>
                <select
                  className={fieldClass}
                  value={exercise.type}
                  onChange={(event) =>
                    changeExerciseType(
                      index,
                      event.target.value as ExerciseType
                    )
                  }
                >
                  <option value="multiple_choice">Trắc nghiệm</option>
                  <option value="true_false">Đúng / Sai</option>
                  <option value="short_answer">Trả lời ngắn</option>
                  <option value="essay">Tự luận</option>
                </select>
              </div>
              {draft.exercises.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      exercises: current.exercises.filter(
                        (_, itemIndex) => itemIndex !== index
                      ),
                    }))
                  }
                  className="pb-2 text-sm text-red-600 hover:underline"
                >
                  Xóa câu
                </button>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold">
                {exercise.type === "true_false" ? "Yêu cầu chung" : "Câu hỏi"}
              </label>
              <textarea
                className={fieldClass}
                rows={3}
                value={exercise.prompt}
                onChange={(event) =>
                  updateExercise(index, {
                    ...exercise,
                    prompt: event.target.value,
                  })
                }
                  placeholder={
                    exercise.type === "true_false"
                      ? "Xác định mỗi ý sau là đúng hay sai."
                      : undefined
                  }
                required
              />
            </div>

            {exercise.type === "multiple_choice" && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Các lựa chọn</p>
                {(exercise.options ?? []).map((option, optionIndex) => (
                  <div key={optionIndex} className="flex gap-2">
                    <input
                      className={fieldClass}
                      value={option}
                      onChange={(event) =>
                        updateExercise(
                          index,
                          updateExerciseOption(
                            exercise,
                            optionIndex,
                            event.target.value
                          )
                        )
                      }
                      placeholder={`Lựa chọn ${optionIndex + 1}`}
                    />
                    {(exercise.options?.length ?? 0) > 2 && (
                      <button
                        type="button"
                        onClick={() =>
                          updateExercise(index, {
                            ...exercise,
                            options: exercise.options?.filter(
                              (_, itemIndex) => itemIndex !== optionIndex
                            ),
                          })
                        }
                        className="px-2 text-red-600"
                        aria-label={`Xóa lựa chọn ${optionIndex + 1}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {(exercise.options?.length ?? 0) < 10 && (
                  <button
                    type="button"
                    onClick={() =>
                      updateExercise(index, {
                        ...exercise,
                        options: [...(exercise.options ?? []), ""],
                      })
                    }
                    className="text-sm font-medium text-violet-700 hover:underline"
                  >
                    + Thêm lựa chọn
                  </button>
                )}
                <label className="block text-sm font-semibold">
                  Đáp án đúng
                  <select
                    className={fieldClass}
                    value={exercise.correctAnswer}
                    onChange={(event) =>
                      updateExercise(index, {
                        ...exercise,
                        correctAnswer: event.target.value,
                      })
                    }
                  >
                    <option value="">Chọn đáp án</option>
                    {(exercise.options ?? []).map((option, optionIndex) => (
                      <option key={optionIndex} value={String(optionIndex)}>
                        Lựa chọn {optionIndex + 1}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {exercise.type === "true_false" && (
              <div className="space-y-3">
                <p className="text-sm font-semibold">
                  Bốn ý và đáp án đúng/sai
                </p>
                {(exercise.statements ?? []).map((statement, statementIndex) => (
                  <div
                    key={statementLabels[statementIndex]}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                  >
                    <label className="min-w-0 flex-1 text-sm font-semibold">
                      <span className="mb-1 block">
                        Ý {statementLabels[statementIndex]}
                      </span>
                      <textarea
                        className={fieldClass}
                        rows={2}
                        value={statement.content}
                        onChange={(event) =>
                          updateExercise(index, {
                            ...exercise,
                            statements: exercise.statements?.map(
                              (item, itemIndex) =>
                                itemIndex === statementIndex
                                  ? { ...item, content: event.target.value }
                                  : item
                            ),
                          })
                        }
                        required
                      />
                    </label>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={statement.correctAnswer === true}
                      aria-label={`Đáp án ý ${statementLabels[statementIndex]}: ${
                        statement.correctAnswer ? "Đúng" : "Sai"
                      }`}
                      onClick={() =>
                        updateExercise(index, {
                          ...exercise,
                          statements: exercise.statements?.map(
                            (item, itemIndex) =>
                              itemIndex === statementIndex
                                ? { ...item, correctAnswer: !item.correctAnswer }
                                : item
                          ),
                        })
                      }
                      className="flex shrink-0 items-center gap-2 self-end rounded-full p-1 text-sm font-semibold sm:self-auto"
                    >
                      <span>
                        {statement.correctAnswer ? "Đúng" : "Sai"}
                      </span>
                      <span
                        className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
                          statement.correctAnswer ? "bg-violet-600" : "bg-slate-400"
                        }`}
                      >
                        <span
                          className={`h-4 w-4 rounded-full bg-white transition-transform ${
                            statement.correctAnswer ? "translate-x-5" : ""
                          }`}
                        />
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {exercise.type === "short_answer" && (
              <label className="block text-sm font-semibold">
                Đáp án chấp nhận
                <input
                  className={fieldClass}
                  value={exercise.correctAnswer}
                  onChange={(event) =>
                    updateExercise(index, {
                      ...exercise,
                      correctAnswer: event.target.value,
                    })
                  }
                  required
                />
              </label>
            )}

            {exercise.type === "essay" && (
              <label className="block text-sm font-semibold">
                Đáp án mẫu / ý chính cần đạt
                <textarea
                  className={fieldClass}
                  rows={3}
                  value={exercise.correctAnswer}
                  onChange={(event) =>
                    updateExercise(index, {
                      ...exercise,
                      correctAnswer: event.target.value,
                    })
                  }
                  required
                />
              </label>
            )}

            <label className="block text-sm font-semibold">
              Giải thích
              <textarea
                className={fieldClass}
                rows={3}
                value={exercise.explanation}
                onChange={(event) =>
                  updateExercise(index, {
                    ...exercise,
                    explanation: event.target.value,
                  })
                }
                required
              />
            </label>
          </article>
        ))}

        <button
          type="button"
          onClick={() =>
            setDraft((current) => ({
              ...current,
              exercises: [...current.exercises, createExercise()],
            }))
          }
          className="rounded-lg border border-violet-300 px-4 py-2 font-semibold text-violet-700"
        >
          + Thêm câu hỏi
        </button>
      </section>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
      >
        {saving ? "Đang đăng bài..." : "Đăng bài học"}
      </button>
    </form>
  );
}
