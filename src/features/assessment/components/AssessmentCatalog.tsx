"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Assessment } from "../types/assessment.types";
import { assessmentService } from "../services/assessment.service";

export default function AssessmentCatalog() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    assessmentService
      .list()
      .then((items) => {
        if (active) setAssessments(items);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Không thể tải danh sách bài kiểm tra."
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
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-700">
          Luyện tập và đánh giá
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Bài kiểm tra
        </h1>
        <p className="mt-2 text-slate-600">
          Chọn một bài kiểm tra để bắt đầu. Hệ thống sẽ tự động lưu câu trả lời của bạn.
        </p>
      </header>

      {loading && (
        <p className="rounded-xl bg-white p-6 text-slate-600" role="status">
          Đang tải danh sách bài kiểm tra...
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-700" role="alert">
          {error}
        </p>
      )}
      {!loading && !error && assessments.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          Hiện chưa có bài kiểm tra nào được xuất bản.
        </p>
      )}

      {!loading && !error && assessments.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assessment) => (
            <article
              key={assessment.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-violet-700">
                {assessment.subject}
              </p>
              <h2 className="mt-2 text-lg font-bold text-slate-900">
                {assessment.title}
              </h2>
              {assessment.description && (
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                  {assessment.description}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                <span>{assessment.durationMinutes} phút</span>
                <span>{assessment.questions?.length ?? 0} câu hỏi</span>
                <span>{assessment.maxAttempts} lượt</span>
              </div>
              <Link
                href={`/assessment/${encodeURIComponent(assessment.id)}`}
                className="mt-5 inline-flex justify-center rounded-xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-800"
              >
                Bắt đầu làm bài
              </Link>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
