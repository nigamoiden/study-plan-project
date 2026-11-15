import type {
  Question,
  QuestionAnswer,
  QuestionResult,
} from "./question.types";

export type AssessmentStatus = "draft" | "published" | "archived";

export type AttemptStatus =
  | "in_progress"
  | "submitted"
  | "graded"
  | "expired";

export type GradingStatus = "pending" | "partially_graded" | "graded";

export interface Assessment {
  id: string;
  title: string;
  description?: string;
  subject: string;
  durationMinutes: number;
  passingScore: number;
  totalPoints: number;
  questions: Question[];
  status: AssessmentStatus;
  maxAttempts: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  userId: string;
  status: AttemptStatus;
  answers: QuestionAnswer[];
  startedAt: string;
  endsAt: string;
  submittedAt?: string;
}

export interface AssessmentResult {
  id: string;
  attemptId: string;
  assessmentId: string;
  userId: string;
  earnedPoints: number;
  totalPoints: number;
  scorePercentage: number;
  correctAnswers: number;
  totalQuestions: number;
  gradingStatus: GradingStatus;
  questionResults: QuestionResult[];
  submittedAt: string;
  gradedAt?: string;
  gradedBy?: string;
}