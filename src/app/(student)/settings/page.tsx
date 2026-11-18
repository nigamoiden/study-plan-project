"use client";

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">Cài đặt</p>
      <h1 className="mt-2 text-3xl font-bold">Tài khoản học tập</h1>
      <section className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div>
          <p className="text-sm text-slate-500">Phiên đăng nhập</p>
          <p className="mt-1 font-semibold text-slate-900">Đang bảo mật bằng session cookie</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Thông báo</p>
          <p className="mt-1 text-slate-700">Nhận kết quả chấm bài trong hộp thư học tập.</p>
        </div>
        <p className="rounded-xl bg-violet-50 p-3 text-sm text-violet-700">
          Thông tin tài khoản được quản lý an toàn bởi Firebase.
        </p>
      </section>
    </main>
  );
}
