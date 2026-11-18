
export type SchoolYear = "10" | "11" | "12";

export type SubjectLevel =
  | "weak"
  | "average"
  | "good"
  | "excellent";

export type SubjectName =
  | "math"
  | "physics"
  | "chemistry"
  | "biology"
  | "english"
  | "literature"
  | "history";

export interface SubjectHistory {
  subject: SubjectName;
  level: SubjectLevel;
  averageScore: number | null;
}

export interface AcademicGoal {
  targetMajor: string;
  targetUniversity: string;
  goals: string[];
}

export interface AcademicHistory {
  schoolYear: SchoolYear;
  subjects: SubjectHistory[];
}

export interface StudyFrequency {
  studyDaysPerWeek: number;
  studyMinutesPerDay: number;
  preferredStudyTime: "morning" | "afternoon" | "evening" | "flexible";
}

export interface DiagnosticQuestion {
  id: string;
  subject: SubjectName;
  question: string;
  options: string[];
}

export interface DiagnosticAnswer {
  questionId: string;
  selectedAnswer: number | null;
}

export interface DiagnosticResult {
  answers: DiagnosticAnswer[];
  totalQuestions: number;
  correctAnswers: number;
  score: number;
}

export interface OnboardingData {
  academicGoal: AcademicGoal;
  academicHistory: AcademicHistory;
  studyFrequency: StudyFrequency;
  diagnosticTest: DiagnosticResult;
  focusSubjects: SubjectName[];
}

export interface OnboardingStepProps {
  data: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export interface OnboardingSaveResponse {
  success: boolean;
  message?: string;
}
