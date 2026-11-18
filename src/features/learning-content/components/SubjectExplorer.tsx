"use client";

import Link from "next/link";

const subjects = [
  ["math", "Toán học"],
  ["physics", "Vật lý"],
  ["chemistry", "Hóa học"],
  ["biology", "Sinh học"],
  ["english", "Tiếng Anh"],
  ["literature", "Ngữ văn"],
  ["history", "Lịch sử"],
] as const;

export default function SubjectExplorer() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">Môn học</p>
      <h1 className="mt-2 text-3xl font-bold">Khám phá môn học</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map(([id, label]) => (
          <Link key={id} href={`/lessons?subject=${id}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-violet-300">
            <h2 className="font-bold text-slate-900">{label}</h2>
            <p className="mt-2 text-sm text-slate-600">Xem bài học và bài tập do giáo viên đăng tải.</p>
          </Link>
        ))}
      </div>
    </main>
  );
}