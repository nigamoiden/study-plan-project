import type { SubjectProgress as SubjectProgressType } from "../types/progress.types";

export default function SubjectProgress({ items }: { items: SubjectProgressType[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article key={item.subject} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex justify-between gap-3">
            <p className="font-semibold">{item.subject}</p>
            <p className="text-sm text-violet-700">{item.averageScore}%</p>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-violet-600" style={{ width: `${item.total ? (item.completed / item.total) * 100 : 0}%` }} />
          </div>
        </article>
      ))}
    </div>
  );
}