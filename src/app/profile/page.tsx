"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";

const roleDetails = {
  student: {
    label: "Học sinh",
    description: "Theo dõi lộ trình học, bài tập và kết quả của bạn.",
    dashboard: "/student-dashboard",
    dashboardLabel: "Mở bảng điều khiển học sinh",
  },
  teacher: {
    label: "Giáo viên",
    description: "Quản lý bài học đã đăng và xác nhận bài tự luận.",
    dashboard: "/teacher/dashboard",
    dashboardLabel: "Mở bảng điều khiển giáo viên",
  },
  admin: {
    label: "Quản trị viên",
    description: "Quản lý và theo dõi hoạt động của hệ thống.",
    dashboard: "/dashboard",
    dashboardLabel: "Mở bảng điều khiển quản trị",
  },
} as const;

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, router, user]);

  if (loading || !user || !profile) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-slate-600">Đang tải hồ sơ...</p>
      </main>
    );
  }

  const details = roleDetails[profile.role];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">
        Tài khoản của bạn
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Hồ sơ cá nhân</h1>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {user.displayName || "Người dùng"}
            </h2>
            <p className="mt-1 text-slate-600">{user.email}</p>
          </div>
          <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-800">
            {details.label}
          </span>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <h3 className="font-semibold text-slate-900">Vai trò tài khoản</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {details.description}
          </p>
          <Link
            href={details.dashboard}
            className="mt-4 inline-flex rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800"
          >
            {details.dashboardLabel}
          </Link>
        </div>
      </section>
    </main>
  );
}
