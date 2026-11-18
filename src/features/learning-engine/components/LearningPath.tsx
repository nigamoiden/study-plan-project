"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { StudyPlan } from "../types/study-plan.types";

export default function LearningPath() {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/study-plan", { credentials: "same-origin" })
      .then(async (response) => {
        const data = await response.json() as { plan?: StudyPlan; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Không thể tải lộ trình.");
        if (active) setPlan(data.plan ?? null);
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : "Không thể tải lộ trình.");
      });
    return () => { active = false; };
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">Lộ trình học tập</p>
      <h1 className="mt-2 text-3xl font-bold">{plan?.title ?? "Lộ trình cá nhân"}</h1>
      {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {plan && (
        <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plan.stages.map((stage) => (
            <article key={stage.week} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-bold text-violet-700">Tuần {stage.week}</p>
              <h2 className="mt-2 font-bold">{stage.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{stage.description}</p>
            </article>
          ))}
        </section>
      )}
      <Link href="/student-dashboard" className="mt-6 inline-block rounded-xl bg-violet-700 px-4 py-2.5 font-semibold text-white">Mở dashboard lộ trình</Link>
    </main>
  );
}