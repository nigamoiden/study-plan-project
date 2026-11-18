import { redirect } from "next/navigation";

import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/require-user";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await adminDb.collection("users").doc(user.uid).get();
  const profileData = profile.data();

  if (profileData?.role === "teacher" || profileData?.role === "admin") {
    redirect("/teacher/lessons");
  }

  const onboardingCompleted = Boolean(profileData?.onboardingCompleted);

  if (!onboardingCompleted) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}