import { redirect } from "next/navigation";

import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/require-user";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await adminDb.collection("users").doc(user.uid).get();
  const role = profile.data()?.role ?? "student";

  if (role !== "teacher" && role !== "admin") {
    redirect("/student-dashboard");
  }

  return <div className="min-h-screen bg-slate-50 text-slate-900">{children}</div>;
}
