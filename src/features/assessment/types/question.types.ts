export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "essay";

export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface QuestionOption {
  id: string;
  content: string;
}

export interface Question {
  id: string;
  subject: string;
  topic?: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  content: string;
  options?: QuestionOption[];
  points: number;
  imageUrl?: string;
}

export type QuestionAnswer =
  | {
      questionId: string;
      type: "multiple_choice";
      selectedOptionId: string | null;
    }
  | {
      questionId: string;
      type: "true_false";
      selectedValue: boolean | null;
    }
  | {
      questionId: string;
      type: "short_answer";
      answer: string;
    }
  | {
      questionId: string;
      type: "essay";
      answer: string;
    };

export interface QuestionAnswerKey {
  questionId: string;
  correctOptionId?: string;
  correctBoolean?: boolean;
  acceptedAnswers?: string[];
  explanation?: string;
  points?: number;
}

export interface QuestionResult {
  questionId: string;
  earnedPoints: number;
  maxPoints: number;
  isCorrect: boolean | null;
  gradingStatus: "graded" | "pending";
  feedback?: string;
}