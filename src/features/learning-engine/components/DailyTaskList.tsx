"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { StudyPlan } from "../types/study-plan.types";

export default function DailyTaskList() {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/study-plan", { credentials: "same-origin" })
      .then(async (response) => {
        const data = await response.json() as { plan?: StudyPlan; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Không thể tải nhiệm vụ.");
        if (active) setPlan(data.plan ?? null);
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : "Không thể tải nhiệm vụ.");
      });
    return () => { active = false; };
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const tasks = plan?.tasks.filter((task) => task.date === today) ?? [];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">Hôm nay</p>
      <h1 className="mt-2 text-3xl font-bold">Nhiệm vụ trong ngày</h1>
      {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      <div className="mt-6 space-y-4">
        {tasks.map((task) => (
          <article key={task.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-violet-700">{task.kind === "learn" ? "Học kiến thức" : "Luyện tập"}</p>
              <h2 className="mt-1 font-bold">{task.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{task.description}</p>
            </div>
            {task.lessonId ? (
              <Link href={`/lessons/${task.lessonId}`} className="shrink-0 rounded-xl bg-violet-700 px-4 py-2.5 font-semibold text-white">Mở nhiệm vụ</Link>
            ) : (
              <Link href="/lessons" className="shrink-0 rounded-xl border border-violet-300 px-4 py-2.5 font-semibold text-violet-700">Chọn bài học</Link>
            )}
          </article>
        ))}
        {!error && tasks.length === 0 && (
          <p className="rounded-2xl border border-dashed p-8 text-center text-slate-600">Hôm nay chưa có nhiệm vụ. Hãy xem lộ trình hoặc luyện tập thêm.</p>
        )}
      </div>
    </main>
  );
}