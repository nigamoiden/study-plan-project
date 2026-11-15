import { getTeacherManagementData } from "../services/admin.service";

export default function TeacherManagement() {
  const teachers = getTeacherManagementData();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-violet-600">Giảng viên</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Danh sách giảng viên</h2>
        </div>
        <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-violet-200 hover:text-violet-700">
          Phê duyệt mới
        </button>
      </div>

      <div className="space-y-4">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-slate-800">{teacher.name}</h3>
              <p className="text-sm text-slate-500">{teacher.email}</p>
              <p className="mt-2 text-xs text-slate-500">{teacher.department}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {teacher.subjects.map((subject) => (
                <span key={subject} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                  {subject}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                teacher.status === "active"
                  ? "bg-emerald-100 text-emerald-700"
                  : teacher.status === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
              }`}>
                {teacher.status}
              </span>
              <span className="text-sm text-slate-500">{teacher.approvals} duyệt</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
