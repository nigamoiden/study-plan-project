
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import AcademicGoalStep from "./AcademicGoalStep";
import AcademicHistoryStep from "./AcademicHistoryStep";
import StudyFrequencyStep from "./StudyFrequencyStep";
import DiagnosticTestStep from "./DiagnosticTestStep";
import OnboardingSummary from "./OnboardingSummary";

import { saveOnboarding } from "../services/onboarding.service";

import type {
  OnboardingData,
} from "../types/onboarding.types";

const initialData: OnboardingData = {
  academicGoal: {
    targetMajor: "",
    targetUniversity: "",
    goals: [],
  },

  academicHistory: {
    schoolYear: "12",
    subjects: [
      { subject: "math", level: "average", averageScore: null },
      { subject: "physics", level: "average", averageScore: null },
      { subject: "chemistry", level: "average", averageScore: null },
      { subject: "biology", level: "average", averageScore: null },
      { subject: "english", level: "average", averageScore: null },
      { subject: "literature", level: "average", averageScore: null },
      { subject: "history", level: "average", averageScore: null },
    ],
  },

  studyFrequency: {
    studyDaysPerWeek: 5,
    studyMinutesPerDay: 60,
    preferredStudyTime: "evening",
  },

  diagnosticTest: {
    answers: [],
    totalQuestions: 0,
    correctAnswers: 0,
    score: 0,
  },
};

const stepTitles = [
  "Định hướng",
  "Học lực",
  "Thói quen",
  "Kiểm tra",
  "Xác nhận",
];

export default function OnboardingWizard() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = 5;
  const progress = ((step + 1) / totalSteps) * 100;

  function updateData(values: Partial<OnboardingData>) {
    setData((current) => ({
      ...current,
      ...values,
    }));
  }

  function nextStep() {
    setError("");
    setStep((current) => Math.min(current + 1, totalSteps - 1));
  }

  function previousStep() {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  }

  function skipDiagnostic() {
    updateData({
      diagnosticTest: {
        answers: [],
        totalQuestions: 0,
        correctAnswers: 0,
        score: 0,
      },
    });

    nextStep();
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    try {
      await saveOnboarding(data);

      router.replace("/student-dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi lưu hồ sơ"
      );
    } finally {
      setLoading(false);
    }
  }

  const commonProps = {
    data,
    onChange: updateData,
    onNext: nextStep,
    onBack: previousStep,
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-violet-600">
                STUDY PLAN
              </p>
              <h1 className="mt-1 text-xl font-bold">
                Thiết lập hồ sơ học tập
              </h1>
            </div>

            <span className="text-sm text-slate-500">
              {step + 1}/{totalSteps}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-violet-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-5 gap-1">
            {stepTitles.map((title, index) => (
              <div
                key={title}
                className={`text-center text-xs ${
                  index <= step
                    ? "font-semibold text-violet-700"
                    : "text-slate-400"
                }`}
              >
                {title}
              </div>
            ))}
          </div>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {step === 0 && (
            <AcademicGoalStep {...commonProps} />
          )}

          {step === 1 && (
            <AcademicHistoryStep {...commonProps} />
          )}

          {step === 2 && (
            <StudyFrequencyStep {...commonProps} />
          )}

          {step === 3 && (
            <DiagnosticTestStep
              {...commonProps}
              onSkip={skipDiagnostic}
            />
          )}

          {step === 4 && (
            <OnboardingSummary
              data={data}
              onBack={previousStep}
              onSubmit={handleSubmit}
              loading={loading}
            />
          )}

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          Bạn có thể cập nhật thông tin học tập sau khi hoàn tất.
        </p>
      </div>
    </main>
  );
}
