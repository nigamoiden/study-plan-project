export default function PerformanceChart({ scores }: { scores: number[] }) {
  return (
    <div className="flex h-40 items-end gap-2 rounded-2xl border border-slate-200 bg-white p-4">
      {(scores.length ? scores : [0]).map((score, index) => (
        <div key={index} className="flex flex-1 flex-col items-center justify-end">
          <div className="w-full rounded-t bg-violet-500" style={{ height: `${Math.max(4, score)}%` }} />
          <span className="mt-2 text-xs text-slate-500">{score}%</span>
        </div>
      ))}
    </div>
  );
}