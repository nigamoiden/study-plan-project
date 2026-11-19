import { redirect } from "next/navigation";

import AdminDashboard from "@/features/administration/components/AdminDashboard";
import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/require-user";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  const [
    users,
    teachers,
    teacherProfiles,
    lessons,
    assessments,
    pendingReviews,
  ] = await Promise.all([
    adminDb.collection("users").count().get(),
    adminDb.collection("users").where("role", "==", "teacher").count().get(),
    adminDb.collection("users").where("role", "==", "teacher").limit(500).get(),
    adminDb.collection("lessons").count().get(),
    adminDb.collection("assessments").count().get(),
    adminDb.collection("lessonGradingReviews").where("status", "==", "pending_review").count().get(),
  ]);

  const realMetrics = [
    {
      label: "Tổng người dùng",
      value: String(users.data().count),
      description: "Tài khoản đã đăng ký trong hệ thống",
      trend: "Thực tế",
      positive: true,
    },
    {
      label: "Giảng viên",
      value: String(teachers.data().count),
      description: "Tài khoản có quyền giáo viên",
      trend: "Thực tế",
      positive: true,
    },
    {
      label: "Bài học đang mở",
      value: String(lessons.data().count),
      description: "Nội dung đã được đăng",
      trend: "Thực tế",
      positive: true,
    },
    {
      label: "Bài cần AI review",
      value: String(pendingReviews.data().count),
      description: `Có ${assessments.data().count} bài kiểm tra trong hệ thống`,
      trend: "Chờ duyệt",
      positive: false,
    },
  ];

  const managedTeachers = teacherProfiles.docs.map((document) => {
    const data = document.data();
    return {
      id: document.id,
      name: String(data.displayName ?? data.name ?? data.email ?? "Giảng viên"),
      email: String(data.email ?? ""),
      department: String(data.department ?? ""),
      subjects: Array.isArray(data.subjects) ? data.subjects.map(String) : [],
      status: data.disabled ? "suspended" as const : "active" as const,
      approvals: typeof data.approvalCount === "number" ? data.approvalCount : 0,
    };
  });

  return (
    <AdminDashboard
      realMetrics={realMetrics}
      teachers={managedTeachers}
    />
  );
}
