import { redirect } from "next/navigation";

import StudyPlanDashboard from "@/features/learning-engine/components/StudyPlanDashboard";
import { requireUser } from "@/server/auth/require-user";
import {
  ensureStudyPlan,
  OnboardingRequiredError,
} from "@/server/learning/study-plan";
import type { StudyPlan } from "@/features/learning-engine/types/study-plan.types";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const user = await requireUser();

  if (!user) {
    redirect("/login");
  }

  let plan: StudyPlan;

  try {
    plan = await ensureStudyPlan(user.uid);
  } catch (error) {
    if (error instanceof OnboardingRequiredError) {
      redirect("/onboarding");
    }

    throw error;
  }

  return <StudyPlanDashboard initialPlan={plan} />;
}
