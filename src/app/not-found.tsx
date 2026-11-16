import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">404</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Trang không tồn tại</h1>
        <p className="mt-2 text-slate-600">Trang bạn đang tìm kiếm không còn hoạt động hoặc đã được di chuyển.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white hover:bg-violet-700">
          Quay lại đăng nhập
        </Link>
      </div>
    </main>
  );
}
