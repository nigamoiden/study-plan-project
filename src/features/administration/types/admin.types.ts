export type UserRole = "admin" | "super_admin" | "teacher" | "student";

export type AccountStatus = "active" | "pending" | "suspended";

export type ReviewStatus = "approved" | "in_review" | "draft";

export type SubjectStatus = "active" | "draft" | "archived";

export type QuestionType =
  | "multiple_choice"
  | "essay"
  | "short_answer"
  | "true_false";

export type DifficultyLevel = "easy" | "medium" | "hard";

export interface DashboardMetric {
  label: string;
  value: string;
  description: string;
  trend: string;
  positive: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: AccountStatus;
  lastLogin: string;
}

export interface TeacherAccount {
  id: string;
  name: string;
  email: string;
  department: string;
  subjects: string[];
  status: AccountStatus;
  approvals: number;
}

export interface SubjectItem {
  id: string;
  name: string;
  code: string;
  instructorCount: number;
  studentCount: number;
  status: SubjectStatus;
}

export interface QuestionItem {
  id: string;
  subject: string;
  topic: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  status: ReviewStatus;
}

export interface ContentItem {
  id: string;
  title: string;
  type: "course" | "lesson" | "assessment";
  owner: string;
  status: ReviewStatus;
  lastUpdated: string;
}

export interface GradingTask {
  id: string;
  student: string;
  subject: string;
  score: string;
  status: "needs_review" | "submitted" | "auto_graded";
  due: string;
}
