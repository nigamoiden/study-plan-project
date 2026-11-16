"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  practiceService,
} from "../services/practice.service";
import type { PracticeItem, PracticeSummary } from "../types/practice.types";

const difficultyMap: Record<string, string> = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
};

export default function PracticeDashboard() {
  const [practiceItems, setPracticeItems] = useState<PracticeItem[]>([]);
  const [summary, setSummary] = useState<PracticeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([
      practiceService.list(),
      fetch("/api/practice/progress", { credentials: "same-origin" }).then(
        async (response) => {
          const data = (await response.json()) as {
            progress?: PracticeSummary;
            error?: string;
          };
          if (!response.ok || !data.progress) {
            throw new Error(data.error ?? "Không thể tải tiến độ luyện tập.");
          }
          return data.progress;
        }
      ),
    ])
      .then(([items, progress]) => {
        if (active) {
          setPracticeItems(items);
          setSummary(progress);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Không thể tải danh sách luyện tập."
          );
          setPracticeItems([]);
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
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
          Practice
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Luyện tập hàng ngày
        </h1>
        <p className="mt-2 text-slate-600">
          Tiếp tục rèn kỹ năng và duy trì streak học tập của bạn.
        </p>
      </header>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Streak</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{summary?.streak ?? "—"} ngày</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Số lượt đã làm</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{summary?.attempts ?? "—"}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Điểm trung bình gần đây</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{summary?.averageScore ?? "—"}%</p>
        </div>
      </section>

      {loading && (
        <p className="rounded-xl border border-slate-200 bg-white p-5 text-slate-600">
          Đang tải danh sách bài luyện tập...
        </p>
      )}

      {error && !loading && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </p>
      )}

      {!loading && practiceItems.length === 0 && !error && (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
          Hiện chưa có bài luyện tập nào khả dụng.
        </p>
      )}

      {!loading && practiceItems.length > 0 && (
        <section className="grid gap-4 lg:grid-cols-2">
          {practiceItems.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-violet-700">{item.subject}</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">{item.title}</h2>
                </div>
                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                  {difficultyMap[item.difficulty]}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={`${item.id}-${tag}`}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                <span>{item.durationMinutes} phút</span>
                <span>{item.xp} XP</span>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                <span>
                  {item.questions.length} câu hỏi
                </span>
                <Link
                  href={`/practice/${item.id}`}
                  className="rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white transition hover:bg-violet-700"
                >
                  Bắt đầu
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
