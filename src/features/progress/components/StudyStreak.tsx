export default function StudyStreak({ streak }: { streak: number }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">Streak học tập</p>
      <p className="mt-2 text-3xl font-bold text-violet-700">{streak} ngày</p>
    </article>
  );
}