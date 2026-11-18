import type { SubjectName } from "@/features/onboarding/types/onboarding.types";

export interface StudyPlanStage {
  week: number;
  title: string;
  description: string;
}

export interface StudyPlanTask {
  id: string;
  date: string;
  subject: SubjectName;
  kind: "learn" | "practice";
  title: string;
  description: string;
  durationMinutes: number;
  completed: boolean;
  completedAt?: string;
  lessonId?: string;
  lessonTitle?: string;
}

export interface StudyPlan {
  title: string;
  targetMajor: string;
  targetUniversity: string;
  studyDaysPerWeek: number;
  studyMinutesPerDay: number;
  generatedAt: string;
  startDate: string;
  endDate: string;
  stages: StudyPlanStage[];
  tasks: StudyPlanTask[];
}
