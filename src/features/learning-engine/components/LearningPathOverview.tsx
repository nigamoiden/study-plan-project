import type { StudyPlan } from "../types/study-plan.types";

export default function LearningPathOverview({ plan }: { plan: StudyPlan }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {plan.stages.map((stage) => (
        <article key={stage.week} className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-bold text-violet-700">Tuần {stage.week}</p>
          <h3 className="mt-1 font-bold">{stage.title}</h3>
        </article>
      ))}
    </section>
  );
}