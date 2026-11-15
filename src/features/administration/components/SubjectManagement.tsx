import { getSubjectManagementData } from "../services/admin.service";

export default function SubjectManagement() {
  const subjects = getSubjectManagementData();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-violet-600">Môn học</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Quản lý môn học</h2>
        </div>
        <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
          + Tạo môn mới
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {subjects.map((subject) => (
          <div key={subject.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">{subject.name}</h3>
                <p className="text-sm text-slate-500">{subject.code}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                subject.status === "active"
                  ? "bg-emerald-100 text-emerald-700"
                  : subject.status === "draft"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-200 text-slate-600"
              }`}>
                {subject.status}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span>{subject.instructorCount} giảng viên</span>
              <span>{subject.studentCount} học viên</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
