import { getSubjectManagementData } from "../services/admin.service";

const subjectStatusLabel: Record<string, string> = {
  active: "Hoạt động",
  draft: "Bản nháp",
  archived: "Đã lưu trữ",
};

export default function SubjectManagement() {
  const subjects = getSubjectManagementData();
  const activeCount = subjects.filter((subject) => subject.status === "active").length;
  const draftCount = subjects.filter((subject) => subject.status === "draft").length;
  const archivedCount = subjects.filter((subject) => subject.status === "archived").length;

  const summaryCards = [
    { label: "Tổng môn", value: subjects.length },
    { label: "Đang hoạt động", value: activeCount },
    { label: "Bản nháp", value: draftCount },
    { label: "Đã lưu trữ", value: archivedCount },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-violet-600">Môn học</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Quản lý môn học</h2>
        </div>

        <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
          + Tạo môn mới
        </button>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {subjects.map((subject) => (
          <article key={subject.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-violet-200 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-md bg-violet-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-700">
                    {subject.code}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-800">{subject.name}</h3>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  subject.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : subject.status === "draft"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-200 text-slate-600"
                }`}
              >
                {subjectStatusLabel[subject.status]}
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-500">Khung chương trình đang được cập nhật theo tiến độ học tập.</p>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Giảng viên</p>
                <p className="mt-1 text-base font-semibold text-slate-800">{subject.instructorCount}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Học viên</p>
                <p className="mt-1 text-base font-semibold text-slate-800">{subject.studentCount}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:text-violet-700">
                Chi tiết
              </button>
              <button className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-violet-700">
                Sửa
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
