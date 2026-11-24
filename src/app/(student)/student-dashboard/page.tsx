import { redirect } from "next/navigation";

import StudyPlanDashboard from "@/features/learning-engine/components/StudyPlanDashboard";
import { requireUser } from "@/server/auth/require-user";
import {
  ensureStudyPlan,
  OnboardingRequiredError,
} from "@/server/learning/study-plan";
import type { StudyPlan } from "@/features/learning-engine/types/study-plan.types";
import { adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const user = await requireUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await adminDb.collection("users").doc(user.uid).get();
  const role = profile.data()?.role ?? "student";

  let plan: StudyPlan;

  try {
    plan = await ensureStudyPlan(user.uid);
  } catch (error) {
    if (error instanceof OnboardingRequiredError) {
      if (role === "student") {
        redirect("/onboarding");
      }
      const now = new Date();
      plan = {
        title: "Lộ trình học tập",
        targetMajor: "Đang cập nhật",
        targetUniversity: "",
        studyDaysPerWeek: 5,
        studyMinutesPerDay: 60,
        generatedAt: now.toISOString(),
        startDate: now.toISOString().slice(0, 10),
        endDate: new Date(now.getTime() + 27 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        stages: [],
        tasks: [],
      };
    } else {
      throw error;
    }
  }

  return <StudyPlanDashboard initialPlan={plan} dashboardRole={role as "student" | "teacher" | "admin" | "super_admin"} />;
}
