type ContentItem = {
  id: string;
  title: string;
  type: "lesson" | "assessment";
  owner: string;
  status: "approved" | "in_review" | "draft";
  lastUpdated: string;
};

export default function ContentManagement({ contentItems }: { contentItems: ContentItem[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-medium text-violet-600">Nội dung</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">Quản lý nội dung</h2>
      </div>
      {contentItems.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          Chưa có bài học hoặc bài kiểm tra thật trong hệ thống.
        </p>
      ) : (
        <div className="space-y-3">
          {contentItems.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase text-slate-700">
                    {item.type === "lesson" ? "Bài học" : "Bài kiểm tra"}
                  </span>
                  <span className="text-xs text-slate-500">{item.owner}</span>
                </div>
                <h3 className="font-semibold text-slate-800">{item.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                  {item.status === "approved" ? "Đã xuất bản" : "Bản nháp"}
                </span>
                <span className="text-xs text-slate-500">{item.lastUpdated}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
