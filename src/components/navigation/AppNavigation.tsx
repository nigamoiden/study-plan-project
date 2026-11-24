"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { logoutUser } from "@/features/auth/services/auth.service";

const navigationByRole = {
  student: [
    { href: "/student-dashboard", label: "Tổng quan" },
    { href: "/today", label: "Hôm nay" },
    { href: "/lessons", label: "Bài học" },
    { href: "/assessments", label: "Bài kiểm tra" },
    { href: "/progress", label: "Tiến độ" },
  ],
  teacher: [
    { href: "/teacher/dashboard", label: "Tổng quan" },
    { href: "/teacher/lessons", label: "Bài học" },
    { href: "/teacher/lessons/new", label: "Soạn bài" },
    { href: "/teacher/lesson-reviews", label: "Chấm bài" },
  ],
  admin: [
    { href: "/dashboard", label: "Quản trị" },
    { href: "/teacher/dashboard", label: "Giảng dạy" },
    { href: "/teacher/lessons", label: "Bài học" },
    { href: "/teacher/lesson-reviews", label: "Chấm bài" },
  ],
  super_admin: [
    { href: "/dashboard", label: "Quản trị" },
    { href: "/teacher/dashboard", label: "Giảng dạy" },
    { href: "/teacher/lessons", label: "Bài học" },
    { href: "/teacher/lesson-reviews", label: "Chấm bài" },
  ],
} as const;

const roleLabels = {
  student: "Học sinh",
  teacher: "Giáo viên",
  admin: "Quản trị viên",
  super_admin: "Super admin",
} as const;

export default function AppNavigation() {
  const { user, profile, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  if (
    loading ||
    !user ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/reset-password"
  ) {
    return null;
  }

  const role = profile?.role ?? "student";
  const links = navigationByRole[role];

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    try {
      await logoutUser();
      router.replace("/login");
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Không thể đăng xuất."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href={role === "admin" || role === "super_admin" ? "/dashboard" : role === "teacher" ? "/teacher/dashboard" : "/student-dashboard"}
          className="text-lg font-bold text-violet-800"
        >
          StudyPlan
        </Link>

        <nav
          aria-label="Điều hướng chính"
          className="flex flex-1 flex-wrap items-center gap-2 sm:justify-center"
        >
          {links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-violet-100 text-violet-800"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="text-sm font-semibold text-slate-700 hover:text-violet-700"
          >
            {user.displayName || roleLabels[role]} · Hồ sơ
          </Link>
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-red-300 hover:text-red-700 disabled:opacity-50"
          >
            {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mx-auto max-w-7xl px-4 pb-3 text-sm text-red-700 sm:px-6 lg:px-8">
          {error}
        </p>
      )}
    </header>
  );
}
