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
  const onboardingCompleted = Boolean(profile.data()?.onboardingCompleted);

  if (!onboardingCompleted) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}