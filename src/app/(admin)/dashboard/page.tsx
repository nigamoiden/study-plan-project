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
    lessonDocuments,
    assessments,
    assessmentDocuments,
    pendingReviews,
    reviewDocuments,
  ] = await Promise.all([
    adminDb.collection("users").count().get(),
    adminDb.collection("users").where("role", "==", "teacher").count().get(),
    adminDb.collection("users").where("role", "==", "teacher").limit(500).get(),
    adminDb.collection("lessons").count().get(),
    adminDb.collection("lessons").limit(500).get(),
    adminDb.collection("assessments").count().get(),
    adminDb.collection("assessments").limit(500).get(),
    adminDb.collection("lessonGradingReviews").where("status", "==", "pending_review").count().get(),
    adminDb.collection("lessonGradingReviews").limit(500).get(),
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

  const subjectLabels: Record<string, string> = {
    math: "Toán",
    physics: "Vật lý",
    chemistry: "Hóa học",
    biology: "Sinh học",
    english: "Tiếng Anh",
    literature: "Ngữ văn",
    history: "Lịch sử",
  };

  const subjectEntries = new Map<string, {
    id: string;
    name: string;
    code: string;
    instructorCount: number;
    studentCount: number;
    status: "active" | "draft" | "archived";
  }>();
  lessonDocuments.docs.forEach((document) => {
    const data = document.data();
    const subject = String(data.subject ?? "");
    if (!subject) return;
    const entry = subjectEntries.get(subject) ?? {
      id: subject,
      name: subjectLabels[subject] ?? subject,
      code: subject.toUpperCase(),
      instructorCount: 0,
      studentCount: 0,
      status: data.status === "published" ? "active" as const : "draft" as const,
    };
    if (data.status === "published") entry.status = "active";
    subjectEntries.set(subject, entry);
  });

  const allUserDocuments = await adminDb.collection("users").limit(500).get();
  allUserDocuments.docs.forEach((document) => {
    const data = document.data();
    if (data.role === "teacher") {
      const subjects = Array.isArray(data.subjects) ? data.subjects.map(String) : [];
      subjects.forEach((subject) => {
        const entry = subjectEntries.get(subject);
        if (entry) entry.instructorCount += 1;
      });
    }
    if (data.role === "student") {
      const subjects = Array.isArray(data.focusSubjects) ? data.focusSubjects.map(String) : [];
      subjects.forEach((subject) => {
        const entry = subjectEntries.get(subject);
        if (entry) entry.studentCount += 1;
      });
    }
  });

  const ownerIds = new Set<string>();
  lessonDocuments.docs.forEach((document) => {
    const ownerId = document.data().createdBy;
    if (typeof ownerId === "string") ownerIds.add(ownerId);
  });
  assessmentDocuments.docs.forEach((document) => {
    const ownerId = document.data().createdBy;
    if (typeof ownerId === "string") ownerIds.add(ownerId);
  });
  const ownerSnapshots = await Promise.all(
    Array.from(ownerIds).map((ownerId) => adminDb.collection("users").doc(ownerId).get())
  );
  const ownerNames = new Map(
    ownerSnapshots.map((snapshot) => [
      snapshot.id,
      String(snapshot.data()?.displayName ?? snapshot.data()?.name ?? snapshot.data()?.email ?? "Người dùng"),
    ])
  );

  const managedContent = [
    ...lessonDocuments.docs.map((document) => {
      const data = document.data();
      const updated = data.updatedAt?.toDate?.();
      return {
        id: document.id,
        title: String(data.title ?? "Bài học"),
        type: "lesson" as const,
        owner: ownerNames.get(String(data.createdBy)) ?? "Người dùng",
        status: data.status === "published" ? "approved" as const : "draft" as const,
        lastUpdated: updated instanceof Date ? updated.toLocaleDateString("vi-VN") : "Chưa cập nhật",
      };
    }),
    ...assessmentDocuments.docs.map((document) => {
      const data = document.data();
      const updated = data.updatedAt?.toDate?.();
      return {
        id: document.id,
        title: String(data.title ?? "Bài kiểm tra"),
        type: "assessment" as const,
        owner: ownerNames.get(String(data.createdBy)) ?? "Người dùng",
        status: data.status === "published" ? "approved" as const : "draft" as const,
        lastUpdated: updated instanceof Date ? updated.toLocaleDateString("vi-VN") : "Chưa cập nhật",
      };
    }),
  ];

  const reviewUserIds = new Set<string>();
  reviewDocuments.docs.forEach((document) => {
    const data = document.data();
    if (typeof data.studentId === "string") reviewUserIds.add(data.studentId);
  });
  const reviewUserSnapshots = await Promise.all(
    Array.from(reviewUserIds).map((uid) => adminDb.collection("users").doc(uid).get())
  );
  const reviewUserNames = new Map(
    reviewUserSnapshots.map((snapshot) => [
      snapshot.id,
      String(snapshot.data()?.displayName ?? snapshot.data()?.name ?? snapshot.data()?.email ?? "Học sinh"),
    ])
  );
  const managedReviews = reviewDocuments.docs.map((document) => {
    const data = document.data();
    const status: "needs_review" | "submitted" | "auto_graded" =
      data.status === "pending_review"
      ? "needs_review"
      : data.status === "submitted"
        ? "submitted"
        : "auto_graded";
    return {
      id: document.id,
      student: String(reviewUserNames.get(String(data.studentId)) ?? data.studentName ?? "Học sinh"),
      subject: String(data.subject ?? data.lessonSubject ?? ""),
      score: data.aiScore !== undefined ? `${data.aiScore}/100` : "Chưa chấm",
      status,
      due: data.status === "reviewed" ? "Đã hoàn tất" : "Chờ review",
    };
  });

  return (
    <AdminDashboard
      realMetrics={realMetrics}
      teachers={managedTeachers}
      subjects={Array.from(subjectEntries.values())}
      content={managedContent}
      reviews={managedReviews}
    />
  );
}
