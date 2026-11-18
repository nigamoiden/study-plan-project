export default function LearningStage({ week, title, description }: { week: number; title: string; description: string }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold text-violet-700">Tuần {week}</p>
      <h3 className="mt-1 font-bold">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </article>
  );
}