export type PracticeDifficulty = "easy" | "medium" | "hard";
export type PracticeQuestionType =
  | "multiple_choice"
  | "short_answer"
  | "essay";

export interface PracticeQuestion {
  id: string;
  type: PracticeQuestionType;
  prompt: string;
  description?: string;
  options?: string[];
  correctOptionId?: string;
  acceptedAnswers?: string[];
  keywords?: string[];
  rubric?: string[];
}

export interface PracticeItem {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  difficulty: PracticeDifficulty;
  xp: number;
  completed: number;
  total: number;
  passingScore: number;
  description: string;
  tags: string[];
  questions: PracticeQuestion[];
}

export interface PracticeSummary {
  attempts: number;
  averageScore: number;
  streak: number;
}

export interface PracticeAnswer {
  questionId: string;
  answer: string | boolean | number | null;
}

export interface PracticeQuestionGrade {
  questionId: string;
  score: number;
  feedback: string;
}

export interface PracticeGradingResult {
  score: number;
  passed: boolean;
  summary: string;
  feedback: string;
  details: PracticeQuestionGrade[];
}
