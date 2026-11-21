"use client";

import Link from "next/link";
import { useState } from "react";

import type { StudyPlan } from "@/features/learning-engine/types/study-plan.types";

const subjectLabels: Record<string, string> = {
  math: "Toán học",
  physics: "Vật lý",
  chemistry: "Hóa học",
  biology: "Sinh học",
  english: "Tiếng Anh",
  literature: "Ngữ văn",
  history: "Lịch sử",
};

function formatDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "numeric",
  });
}

function todayInVietnam(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

export default function StudyPlanDashboard({
  initialPlan,
  dashboardRole = "student",
}: {
  initialPlan: StudyPlan;
  dashboardRole?: "student" | "teacher" | "admin";
}) {
  const [plan, setPlan] = useState(initialPlan);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const completedCount = plan.tasks.filter((task) => task.completed).length;
  const progress =
    plan.tasks.length === 0
      ? 0
      : Math.round((completedCount / plan.tasks.length) * 100);
  const today = todayInVietnam();
  const visibleTasks = plan.tasks.filter((task) => task.date >= today).slice(0, 14);

  async function updateTaskCompletion(taskId: string, completed: boolean) {
    setUpdatingTaskId(taskId);
    setError("");

    try {
      const response = await fetch(
        `/api/study-plan/tasks/${encodeURIComponent(taskId)}/complete`,
        {
          method: completed ? "POST" : "DELETE",
          credentials: "same-origin",
        }
      );
      const data = (await response.json()) as {
        plan?: StudyPlan;
        error?: string;
      };

      if (!response.ok || !data.plan) {
        throw new Error(data.error ?? "Không thể cập nhật nhiệm vụ.");
      }

      setPlan(data.plan);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Không thể cập nhật nhiệm vụ."
      );
    } finally {
      setUpdatingTaskId(null);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
            Lộ trình cá nhân
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{plan.title}</h1>
          <p className="mt-2 text-slate-600">
            {plan.targetUniversity
              ? `Mục tiêu: ${plan.targetMajor} · ${plan.targetUniversity}`
              : `Mục tiêu: ${plan.targetMajor}`}
          </p>
        </div>
        <nav className="flex flex-wrap gap-3 text-sm font-medium">
          {dashboardRole === "admin" && (
            <>
              <Link href="/dashboard" className="rounded-full bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">
                Mở Admin Dashboard
              </Link>
              <Link href="/teacher/dashboard" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-700">
                Mở Teacher Dashboard
              </Link>
            </>
          )}
          {dashboardRole === "teacher" && (
            <Link href="/teacher/dashboard" className="rounded-full bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">
              Mở Teacher Dashboard
            </Link>
          )}
          <Link
            href="/lessons"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:border-violet-200 hover:text-violet-700"
          >
            Thư viện bài học
          </Link>
          <Link
            href="/progress"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:border-violet-200 hover:text-violet-700"
          >
            Tiến độ
          </Link>
          <Link
            href="/today"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:border-violet-200 hover:text-violet-700"
          >
            Hôm nay
          </Link>
          <Link
            href="/assessments"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:border-violet-200 hover:text-violet-700"
          >
            Bài kiểm tra
          </Link>
          <Link
            href="/practice"
            className="rounded-full bg-violet-700 px-4 py-2 text-white hover:bg-violet-800"
          >
            Luyện tập
          </Link>
          <Link
            href="/inbox"
            className="rounded-full border border-violet-200 bg-white px-4 py-2 text-violet-700"
          >
            Hộp thư
          </Link>
        </nav>
      </header>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Tiến độ lộ trình</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{progress}%</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-violet-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {completedCount}/{plan.tasks.length} nhiệm vụ hoàn thành
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Nhịp học đã chọn</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {plan.studyDaysPerWeek} ngày/tuần
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Khoảng {plan.studyMinutesPerDay} phút mỗi ngày học
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Chặng hiện tại</p>
          <p className="mt-2 text-xl font-bold text-slate-900">
            {plan.stages.filter((stage) => {
              const weekStart = new Date(`${plan.startDate}T00:00:00Z`);
              weekStart.setUTCDate(weekStart.getUTCDate() + (stage.week - 1) * 7);
              return today >= weekStart.toISOString().slice(0, 10);
            }).pop()?.title ?? plan.stages[0]?.title ?? "Đang cập nhật"}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Lộ trình từ {formatDate(plan.startDate)} đến {formatDate(plan.endDate)}
          </p>
        </article>
      </section>

      <section className="mb-8 rounded-2xl border border-violet-100 bg-violet-50 p-5">
        <h2 className="font-bold text-slate-900">Các giai đoạn</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {plan.stages.map((stage) => (
            <article key={stage.week} className="rounded-xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                Tuần {stage.week}
              </p>
              <h3 className="mt-1 font-semibold text-slate-900">{stage.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{stage.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">Nhiệm vụ sắp tới</h2>
          <p className="mt-1 text-sm text-slate-600">
            Hoàn thành nhiệm vụ để cập nhật tiến độ lộ trình của bạn.
          </p>
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {visibleTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            Bạn đã hoàn thành lộ trình hiện tại. Hãy tiếp tục với{" "}
            <Link href="/practice" className="font-semibold text-violet-700 hover:underline">
              bài luyện tập
            </Link>
            .
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(new Set(visibleTasks.map((task) => task.date))).map((date) => (
              <div key={date}>
                <h3 className="mb-3 text-sm font-semibold capitalize text-slate-600">
                  {date === today ? "Hôm nay" : formatDate(date)}
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {visibleTasks
                    .filter((task) => task.date === date)
                    .map((task) => (
                      <article
                        key={task.id}
                        className={`rounded-2xl border bg-white p-5 shadow-sm ${
                          task.completed
                            ? "border-emerald-200"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                              {task.kind === "learn" ? "Kiến thức" : "Luyện tập"} ·{" "}
                              {subjectLabels[task.subject] ?? task.subject}
                            </p>
                            <h4 className="mt-1 font-bold text-slate-900">{task.title}</h4>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {task.description}
                            </p>
                            <p className="mt-3 text-xs text-slate-500">
                              Khoảng {task.durationMinutes} phút
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-2">
                            {task.lessonId ? (
                              <Link
                                href={`/lessons/${encodeURIComponent(task.lessonId)}${task.kind === "practice" ? "#bai-tap" : ""}`}
                                className="rounded-xl bg-violet-700 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-800"
                              >
                                {task.kind === "learn" ? "Mở bài học" : "Làm bài tập"}
                              </Link>
                            ) : (
                              <Link
                                href="/lessons"
                                className="rounded-xl border border-violet-200 px-3 py-2 text-sm font-semibold text-violet-700"
                              >
                                Chọn bài học
                              </Link>
                            )}
                            <button
                              type="button"
                              disabled={updatingTaskId !== null}
                              onClick={() =>
                                void updateTaskCompletion(task.id, !task.completed)
                              }
                              className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                                task.completed
                                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                                  : "border border-slate-300 bg-white text-slate-700 hover:border-violet-300 disabled:opacity-50"
                              }`}
                            >
                              {updatingTaskId === task.id
                                ? "Đang lưu..."
                                : task.completed
                                  ? "Bỏ đánh dấu hoàn thành"
                                  : "Đánh dấu xong"}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
