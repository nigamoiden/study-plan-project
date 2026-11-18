import type { PracticeSummary } from "@/features/practice/types/practice.types";
import type { StudyPlan } from "@/features/learning-engine/types/study-plan.types";

export async function getProgressData(): Promise<{
  practice: PracticeSummary | null;
  plan: StudyPlan | null;
}> {
  const [practiceResponse, planResponse] = await Promise.all([
    fetch("/api/practice/progress", { credentials: "same-origin" }),
    fetch("/api/study-plan", { credentials: "same-origin" }),
  ]);
  const [practiceData, planData] = await Promise.all([
    practiceResponse.json(),
    planResponse.json(),
  ]);
  return {
    practice: practiceData.progress ?? null,
    plan: planData.plan ?? null,
  };
}