import { redirect } from "next/navigation";

import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/require-user";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await requireUser();

  if (!sessionUser) {
    redirect("/login");
  }

  const profile = await adminDb.collection("users").doc(sessionUser.uid).get();
  const role = profile.data()?.role;

  if (role !== "admin") {
    redirect("/dashboard");
  }

  return <div className="min-h-screen bg-slate-100 text-slate-900">{children}</div>;
}
