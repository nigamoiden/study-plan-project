import type { SubjectName } from "@/features/onboarding/types/onboarding.types";

export interface LearningProfileSummary {
  subject: SubjectName;
  level: "weak" | "average" | "good" | "excellent";
  priority: number;
}