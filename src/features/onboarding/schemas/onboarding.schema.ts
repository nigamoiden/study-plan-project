
import { z } from "zod";
import { SUBJECT_NAMES } from "@/features/learning-content/constants";

const subjectHistorySchema = z.object({
  subject: z.enum([
    "math",
    "physics",
    "chemistry",
    "biology",
    "english",
    "literature",
    "history",
  ]),
  level: z.enum([
    "weak",
    "average",
    "good",
    "excellent",
  ]),
  averageScore: z.number().min(0).max(10).nullable(),
}).strict();

export const onboardingSchema = z.object({
  academicGoal: z.object({
    targetMajor: z.string().trim().min(2).max(150),
    targetUniversity: z.string().max(150),
    goals: z.array(z.string().max(100)).max(10),
  }).strict(),

  academicHistory: z.object({
    schoolYear: z.enum(["10", "11", "12"]),
    subjects: z.array(subjectHistorySchema).min(1).max(7),
  }).strict(),

  studyFrequency: z.object({
    studyDaysPerWeek: z.number().int().min(1).max(7),
    studyMinutesPerDay: z.number().int().min(15).max(240),
    preferredStudyTime: z.enum([
      "morning",
      "afternoon",
      "evening",
      "flexible",
    ]),
  }).strict(),

  diagnosticTest: z.object({
    answers: z.array(
      z.object({
        questionId: z.string().min(1),
        selectedAnswer: z.number().int().min(0).max(3).nullable(),
      }).strict()
    ).max(50),
    totalQuestions: z.number().int().min(0).max(50),
    correctAnswers: z.number().int().min(0).max(50),
    score: z.number().min(0).max(100),
  }).strict(),

  focusSubjects: z
    .array(z.enum(SUBJECT_NAMES))
    .min(1, "Hãy chọn ít nhất một môn cần tập trung.")
    .max(SUBJECT_NAMES.length),
}).strict();

export type OnboardingFormData = z.infer<
  typeof onboardingSchema
>;
