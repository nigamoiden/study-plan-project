import Link from "next/link";
import ContentManagement from "./ContentManagement";
import GradingReview from "./GradingReview";
import QuestionManagement from "./QuestionManagement";
import SubjectManagement from "./SubjectManagement";
import TeacherManagement from "./TeacherManagement";
import UserManagement from "./UserManagement";

export default function AdminDashboard({
  realMetrics,
  teachers = [],
  subjects = [],
  content = [],
  reviews = [],
}: {
  realMetrics?: Array<{
    label: string;
    value: string;
    description: string;
    trend: string;
    positive: boolean;
  }>;
  teachers?: Array<{
    id: string;
    name: string;
    email: string;
    department: string;
    subjects: string[];
    status: "active" | "pending" | "suspended";
    approvals: number;
  }>;
  subjects?: Array<{
    id: string;
    name: string;
    code: string;
    instructorCount: number;
    studentCount: number;
    status: "active" | "draft" | "archived";
  }>;
  content?: Array<{
    id: string;
    title: string;
    type: "lesson" | "assessment";
    owner: string;
    status: "approved" | "in_review" | "draft";
    lastUpdated: string;
  }>;
  reviews?: Array<{
    id: string;
    student: string;
    subject: string;
    score: string;
    status: "needs_review" | "submitted" | "auto_graded";
    due: string;
  }>;
}) {
  const metrics = realMetrics ?? [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-600">
            Administration
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Tổng quan hệ thống
          </h1>
        </div>

        <Link
          href="/teacher/lessons"
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
        >
          Quản lý bài học
        </Link>
      </header>

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-slate-500">{metric.label}</p>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  metric.positive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {metric.trend}
              </span>
            </div>

            <div className="text-3xl font-bold text-slate-900">{metric.value}</div>
            <p className="mt-2 text-sm text-slate-500">{metric.description}</p>
          </article>
        ))}
      </section>

      <div className="space-y-8">
        <UserManagement />
        <TeacherManagement teachers={teachers} />
        <SubjectManagement subjects={subjects} />
        <QuestionManagement />
        <ContentManagement contentItems={content} />
        <GradingReview tasks={reviews} />
      </div>
    </main>
  );
}
