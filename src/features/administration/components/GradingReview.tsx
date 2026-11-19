type ReviewTask = {
  id: string;
  student: string;
  subject: string;
  score: string;
  status: "needs_review" | "submitted" | "auto_graded";
  due: string;
};

export default function GradingReview({ tasks }: { tasks: ReviewTask[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-medium text-violet-600">Chấm điểm</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">Review bài nộp</h2>
      </div>
      {tasks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          Chưa có bài nộp thật để review.
        </p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-slate-800">{task.student}</p>
                <p className="text-sm text-slate-500">{task.subject || "Chưa phân môn"}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-slate-900">{task.score}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{task.due}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
