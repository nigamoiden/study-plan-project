import type { SubjectName } from "@/features/onboarding/types/onboarding.types";

export type ExerciseType =
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "essay";

export interface SketchPoint {
  x: number;
  y: number;
}

export type SketchShape =
  | {
      type: "line";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }
  | {
      type: "circle";
      cx: number;
      cy: number;
      r: number;
    }
  | {
      type: "rectangle";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "freehand";
      points: SketchPoint[];
    };

export type LessonBlock =
  | {
      type: "theory";
      text: string;
    }
  | {
      type: "image";
      url: string;
      alt: string;
    }
  | {
      type: "sketch";
      title: string;
      shapes: SketchShape[];
    }
  | {
      type: "simulation";
      title: string;
      url: string;
    };

export interface LessonExercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  options?: string[];
  statements?: Array<{
    content: string;
    correctAnswer?: boolean;
  }>;
  correctAnswer?: string;
  explanation?: string;
}

export interface LessonDraft {
  title: string;
  description: string;
  subject: SubjectName;
  topic: string;
  blocks: LessonBlock[];
  exercises: LessonExercise[];
}

export interface Lesson extends LessonDraft {
  id: string;
  createdBy: string;
  createdAt: string | null;
  updatedAt: string | null;
  answerVisible?: boolean;
}