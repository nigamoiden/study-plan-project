export interface SubjectProgress {
  subject: string;
  completed: number;
  total: number;
  averageScore: number;
}

export interface ProgressSnapshot {
  routeProgress: number;
  practiceAttempts: number;
  averageScore: number;
  streak: number;
  weakSubjects: string[];
}