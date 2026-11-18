import Link from "next/link";

import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/require-user";
import { requireTeacherOrAdmin } from "@/server/assessment/permissions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const user = await requireUser();
  if (!user) redirect("/login");
  await requireTeacherOrAdmin(user.uid);

  const profile = await adminDb.collection("users").doc(user.uid).get();
  const role = profile.data()?.role ?? "student";

  let lessonQuery: FirebaseFirestore.Query = adminDb.collection("lessons");
  if (role !== "admin") {
    lessonQuery = lessonQuery.where("createdBy", "==", user.uid);
  }
  let reviewQuery: FirebaseFirestore.Query = adminDb.collection("lessonGradingReviews");
  if (role !== "admin") {
    reviewQuery = reviewQuery.where("teacherId", "==", user.uid);
  }

  const [lessonCount, reviewSnapshot, submittedSnapshot] = await Promise.all([
    lessonQuery.count().get(),
    reviewQuery.limit(200).get(),
    adminDb.collection("lessonGradingReviews").limit(500).get(),
  ]);

  const pendingReviews = reviewSnapshot.docs.filter(
    (document) => document.data().status === "pending_review"
  ).length;
  const reviewedCount = reviewSnapshot.docs.filter(
    (document) => document.data().status === "reviewed"
  ).length;

  const recentReviews = reviewSnapshot.docs
    .slice(0, 5)
    .map((document) => {
      const data = document.data();
      return {
        id: document.id,
        studentName: data.studentName ?? "Học sinh",
        lessonTitle: data.lessonTitle ?? "Bài học",
        status: data.status ?? "pending_review",
        aiScore: Number(data.aiScore ?? 0),
      };
    });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">
            Dashboard giáo viên
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Tổng quan giảng dạy</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/teacher/lessons/new" className="rounded-xl bg-violet-700 px-4 py-2.5 font-semibold text-white">
            Đăng bài mới
          </Link>
          <Link href="/teacher/lesson-reviews" className="rounded-xl border border-violet-300 bg-white px-4 py-2.5 font-semibold text-violet-700">
            Xem bài chờ duyệt
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Bài học đã đăng", lessonCount.data().count],
          ["Bài chờ AI review", pendingReviews],
          ["Bài đã xem xét", reviewedCount],
          ["Bài nộp gần đây", submittedSnapshot.docs.length],
        ].map(([label, value]) => (
          <article key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Yêu cầu chấm gần đây</h2>
            <Link href="/teacher/lesson-reviews" className="text-sm font-semibold text-violet-700">
              Xem tất cả
            </Link>
          </div>
          {recentReviews.length === 0 ? (
            <p className="mt-5 rounded-xl bg-slate-50 p-5 text-slate-600">Chưa có bài nộp cần chấm.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentReviews.map((review) => (
                <div key={review.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                  <div>
                    <p className="font-semibold text-slate-900">{review.studentName}</p>
                    <p className="text-sm text-slate-500">{review.lessonTitle}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${review.status === "pending_review" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {review.status === "pending_review" ? `AI ${review.aiScore}%` : "Đã duyệt"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-bold">Quản lý nhanh</h2>
          <div className="mt-4 space-y-3">
            <Link href="/teacher/lessons" className="block rounded-xl bg-slate-50 p-4 font-semibold text-slate-800 hover:bg-violet-50">
              Danh sách bài học
            </Link>
            <Link href="/teacher/lessons/new" className="block rounded-xl bg-slate-50 p-4 font-semibold text-slate-800 hover:bg-violet-50">
              Tạo nội dung mới
            </Link>
            <Link href="/teacher/lesson-reviews" className="block rounded-xl bg-slate-50 p-4 font-semibold text-slate-800 hover:bg-violet-50">
              Chấm bài tự luận
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
