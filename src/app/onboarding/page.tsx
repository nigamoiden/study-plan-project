
import { redirect } from "next/navigation";

import { requireUser } from "@/server/auth/require-user";
import OnboardingWizard from "@/features/onboarding/components/OnboardingWizard";

export default async function OnboardingPage() {
  const user = await requireUser();

  if (!user) {
    redirect("/login");
  }

  return <OnboardingWizard />;
}
