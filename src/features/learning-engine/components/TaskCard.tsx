import type { StudyPlanTask } from "../types/study-plan.types";

export default function TaskCard({ task }: { task: StudyPlanTask }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold text-violet-700">{task.kind === "learn" ? "Học kiến thức" : "Luyện tập"}</p>
      <h3 className="mt-1 font-bold">{task.title}</h3>
      <p className="mt-2 text-sm text-slate-600">{task.description}</p>
    </article>
  );
}