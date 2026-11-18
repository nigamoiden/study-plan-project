"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { practiceService } from "@/features/practice/services/practice.service";
import type {
  PracticeAnswer,
  PracticeGradingResult,
  PracticeItem,
} from "@/features/practice/types/practice.types";

export default function PracticeSession({ practiceId }: { practiceId: string }) {
  const [practice, setPractice] = useState<PracticeItem | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | boolean | number | null>>({});
  const [result, setResult] = useState<PracticeGradingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    practiceService
      .get(practiceId)
      .then((item) => {
        if (active) setPractice(item);
      })
      .catch((cause: unknown) => {
        if (active) {
          const message =
            cause instanceof Error ? cause.message : "Không thể tải bài luyện tập.";
          setError(message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [practiceId]);

  if (loading) {
    return <main className="mx-auto max-w-4xl px-4 py-10 text-slate-600">Đang tải bài luyện tập...</main>;
  }

  if (error || !practice) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error || "Không tìm thấy bài luyện tập."}
        </p>
        <Link href="/practice" className="mt-4 inline-block text-violet-700">
          ← Quay lại danh sách luyện tập
        </Link>
      </main>
    );
  }

  const handleChange = (questionId: string, value: string | boolean | number | null) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  };

  const handleSubmit = async () => {
    const unansweredCount = practice.questions.filter(
      (question) => {
        const answer = answers[question.id];
        return answer === undefined ||
          answer === null ||
          (typeof answer === "string" && answer.trim().length === 0);
      }
    ).length;

    if (unansweredCount > 0) {
      setError(`Còn ${unansweredCount} câu chưa trả lời.`);
      return;
    }

    const payload: PracticeAnswer[] = practice.questions.map((question) => ({
      questionId: question.id,
      answer: answers[question.id] ?? "",
    }));

    try {
      setSubmitting(true);
      setError("");
      const grading = await practiceService.submit(practiceId, payload);
      setResult(grading);
    } catch (cause: unknown) {
      const message =
        cause instanceof Error ? cause.message : "Không thể chấm điểm bài luyện tập.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/practice" className="text-sm font-medium text-violet-700">
          ← Quay lại Practice
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">{practice.title}</h1>
        <p className="mt-2 text-slate-600">{practice.description}</p>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Môn</p>
          <p className="mt-1 font-semibold text-slate-900">{practice.subject}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Thời lượng</p>
          <p className="mt-1 font-semibold text-slate-900">{practice.durationMinutes} phút</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Điểm đạt</p>
          <p className="mt-1 font-semibold text-slate-900">{practice.passingScore}%</p>
        </div>
      </div>

      <section className="space-y-5">
        {practice.questions.map((question, index) => (
          <article key={question.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-violet-700">
              Câu {index + 1}
            </p>
            <h2 className="text-lg font-semibold text-slate-900">{question.prompt}</h2>

            {question.type === "multiple_choice" && question.options && (
              <div className="mt-4 space-y-3">
                {question.options.map((option) => (
                  <label key={option} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-slate-700">
                    <input
                      type="radio"
                      name={question.id}
                      checked={answers[question.id] === option}
                      onChange={() => handleChange(question.id, option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {question.type === "short_answer" && (
              <textarea
                value={String(answers[question.id] ?? "")}
                onChange={(event) => handleChange(question.id, event.target.value)}
                className="mt-4 min-h-28 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 outline-none ring-0 transition focus:border-violet-400"
                placeholder="Viết câu trả lời của bạn..."
              />
            )}

            {question.type === "essay" && (
              <textarea
                value={String(answers[question.id] ?? "")}
                onChange={(event) => handleChange(question.id, event.target.value)}
                className="mt-4 min-h-40 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 outline-none transition focus:border-violet-400"
                placeholder="Trả lời theo định dạng ngắn gọn, rõ ràng, có diễn giải logic..."
              />
            )}
          </article>
        ))}
      </section>

      {error && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Chấm tự động</p>
          <p className="text-sm font-medium text-slate-700">
            AI chấm câu tự luận khi đã cấu hình; các câu còn lại dùng rubric/đáp án mẫu trên máy chủ.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Đang chấm điểm..." : "Nộp bài & xem kết quả"}
        </button>
      </div>

      {result && (
        <section className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-violet-700">
                Kết quả chấm bài
              </p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{result.score}/100</h3>
            </div>
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${result.passed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              {result.passed ? "Đạt" : "Chưa đạt"}
            </span>
          </div>

          <p className="mt-4 text-slate-700">{result.summary}</p>
          <p className="mt-2 text-sm text-slate-600">{result.feedback}</p>

          <div className="mt-5 space-y-3">
            {result.details.map((detail, index) => (
              <div key={detail.questionId} className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-800">Câu {index + 1}</p>
                  <span className="text-sm font-semibold text-violet-700">{detail.score}/100</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{detail.feedback}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
