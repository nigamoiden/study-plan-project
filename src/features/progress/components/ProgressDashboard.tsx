"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { PracticeSummary } from "@/features/practice/types/practice.types";
import type { StudyPlan } from "@/features/learning-engine/types/study-plan.types";

export default function ProgressDashboard() {
  const [practice, setPractice] = useState<PracticeSummary | null>(null);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/practice/progress", { credentials: "same-origin" }).then((response) => response.json()),
      fetch("/api/study-plan", { credentials: "same-origin" }).then((response) => response.json()),
    ])
      .then(([practiceData, planData]) => {
        if (!active) return;
        setPractice(practiceData.progress ?? null);
        setPlan(planData.plan ?? null);
        if (practiceData.error || planData.error) setError(practiceData.error ?? planData.error);
      })
      .catch(() => {
        if (active) setError("Không thể tải dữ liệu tiến độ.");
      });
    return () => { active = false; };
  }, []);

  const completed = plan?.tasks.filter((task) => task.completed).length ?? 0;
  const total = plan?.tasks.length ?? 0;
  const routeProgress = total ? Math.round((completed / total) * 100) : 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">Tiến độ</p>
      <h1 className="mt-2 text-3xl font-bold">Tổng quan học tập</h1>
      {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      <section className="mt-6 grid gap-4 md:grid-cols-4">
        {[
          ["Tiến độ lộ trình", `${routeProgress}%`],
          ["Nhiệm vụ hoàn thành", `${completed}/${total}`],
          ["Streak luyện tập", `${practice?.streak ?? 0} ngày`],
          ["Điểm trung bình", `${practice?.averageScore ?? 0}%`],
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-bold">{value}</p>
          </article>
        ))}
      </section>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/student-dashboard" className="rounded-xl bg-violet-700 px-4 py-2.5 font-semibold text-white">Xem lộ trình</Link>
        <Link href="/practice" className="rounded-xl border border-violet-300 px-4 py-2.5 font-semibold text-violet-700">Luyện tập</Link>
      </div>
    </main>
  );
}