import { getQuestionBankData } from "../services/admin.service";

export default function QuestionManagement() {
  const questions = getQuestionBankData();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-violet-600">Ngân hàng câu hỏi</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Câu hỏi và đề thi</h2>
        </div>
        <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-violet-200 hover:text-violet-700">
          Xuất bản bộ câu hỏi
        </button>
      </div>

      <div className="space-y-3">
        {questions.map((question) => (
          <div key={question.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
                  {question.type}
                </span>
                <span className="text-xs text-slate-500">{question.subject}</span>
              </div>
              <p className="font-semibold text-slate-800">{question.topic}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                {question.difficulty}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                question.status === "approved"
                  ? "bg-emerald-100 text-emerald-700"
                  : question.status === "in_review"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-200 text-slate-600"
              }`}>
                {question.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
