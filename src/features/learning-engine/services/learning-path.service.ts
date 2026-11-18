import type { StudyPlan } from "../types/study-plan.types";

export async function getLearningPath(): Promise<StudyPlan> {
  const response = await fetch("/api/study-plan", { credentials: "same-origin" });
  const data = await response.json() as { plan?: StudyPlan; error?: string };
  if (!response.ok || !data.plan) throw new Error(data.error ?? "Không thể tải lộ trình.");
  return data.plan;
}