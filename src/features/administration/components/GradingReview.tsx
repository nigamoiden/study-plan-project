import { getGradingReviewData } from "../services/admin.service";

export default function GradingReview() {
  const tasks = getGradingReviewData();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-violet-600">Chấm điểm</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Review bài nộp</h2>
        </div>
        <button className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
          Chấm tự động
        </button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-slate-800">{task.student}</p>
              <p className="text-sm text-slate-500">{task.subject}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-slate-900">{task.score}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                task.status === "needs_review"
                  ? "bg-amber-100 text-amber-700"
                  : task.status === "submitted"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-emerald-100 text-emerald-700"
              }`}>
                {task.status}
              </span>
            </div>

            <span className="text-sm text-slate-500">{task.due}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
