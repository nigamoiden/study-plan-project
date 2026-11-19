type Subject = {
  id: string;
  name: string;
  code: string;
  instructorCount: number;
  studentCount: number;
  status: "active" | "draft" | "archived";
};

export default function SubjectManagement({ subjects }: { subjects: Subject[] }) {
  const activeCount = subjects.filter((subject) => subject.status === "active").length;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-medium text-violet-600">Môn học</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">Quản lý môn học</h2>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Tổng môn", subjects.length],
          ["Đang hoạt động", activeCount],
          ["Bản nháp", subjects.filter((subject) => subject.status === "draft").length],
          ["Đã lưu trữ", subjects.filter((subject) => subject.status === "archived").length],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {subjects.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          Chưa có môn học từ bài học hoặc dữ liệu người dùng thật.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {subjects.map((subject) => (
            <article key={subject.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="rounded-md bg-violet-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-700">
                    {subject.code}
                  </span>
                  <h3 className="mt-2 font-semibold text-slate-800">{subject.name}</h3>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${subject.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                  {subject.status === "active" ? "Hoạt động" : subject.status === "draft" ? "Bản nháp" : "Đã lưu trữ"}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
                <div><p className="text-xs text-slate-500">Giảng viên</p><p className="mt-1 font-semibold">{subject.instructorCount}</p></div>
                <div><p className="text-xs text-slate-500">Học viên</p><p className="mt-1 font-semibold">{subject.studentCount}</p></div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
