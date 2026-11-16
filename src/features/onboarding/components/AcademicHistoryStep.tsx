
"use client";

import type {
  OnboardingStepProps,
  SubjectName,
  SubjectLevel,
} from "../types/onboarding.types";

const subjects: { id: SubjectName; label: string }[] = [
  { id: "math", label: "Toán học" },
  { id: "physics", label: "Vật lý" },
  { id: "chemistry", label: "Hóa học" },
  { id: "biology", label: "Sinh học" },
  { id: "english", label: "Tiếng Anh" },
  { id: "literature", label: "Ngữ văn" },
  { id: "history", label: "Lịch sử" },
];

const levels: { value: SubjectLevel; label: string }[] = [
  { value: "weak", label: "Yếu" },
  { value: "average", label: "Trung bình" },
  { value: "good", label: "Khá" },
  { value: "excellent", label: "Tốt" },
];

export default function AcademicHistoryStep({
  data,
  onChange,
  onNext,
  onBack,
}: OnboardingStepProps) {
  const history = data.academicHistory;

  function updateSubject(
    subject: SubjectName,
    values: Partial<{
      level: SubjectLevel;
      averageScore: number | null;
    }>
  ) {
    const existing = history.subjects.find(
      (item) => item.subject === subject
    );

    const subjects = existing
      ? history.subjects.map((item) =>
          item.subject === subject
            ? { ...item, ...values }
            : item
        )
      : [
          ...history.subjects,
          {
            subject,
            level: "average" as SubjectLevel,
            averageScore: null,
            ...values,
          },
        ];

    onChange({
      academicHistory: {
        ...history,
        subjects,
      },
    });
  }

  return (
    <section>
      <p className="mb-2 text-sm font-semibold text-violet-600">
        BƯỚC 02
      </p>

      <h2 className="text-2xl font-bold">
        Tình hình học tập hiện tại
      </h2>

      <p className="mb-8 mt-2 text-slate-500">
        Hãy đánh giá trình độ hiện tại của bạn ở từng môn.
      </p>

      <div className="mb-8">
        <label className="mb-3 block font-semibold">
          Bạn đang học lớp
        </label>

        <div className="grid grid-cols-3 gap-3">
          {(["10", "11", "12"] as const).map((year) => (
            <button
              type="button"
              key={year}
              onClick={() =>
                onChange({
                  academicHistory: {
                    ...history,
                    schoolYear: year,
                  },
                })
              }
              className={`rounded-xl border p-4 font-semibold ${
                history.schoolYear === year
                  ? "border-violet-600 bg-violet-50 text-violet-700"
                  : "border-slate-200"
              }`}
            >
              Lớp {year}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {subjects.map((subject) => {
          const current = history.subjects.find(
            (item) => item.subject === subject.id
          );

          return (
            <div key={subject.id}>
              <p className="mb-2 font-semibold">
                {subject.label}
              </p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {levels.map((level) => (
                  <button
                    type="button"
                    key={level.value}
                    onClick={() =>
                      updateSubject(subject.id, {
                        level: level.value,
                      })
                    }
                    className={`rounded-lg border p-2 text-sm ${
                      current?.level === level.value
                        ? "border-violet-600 bg-violet-50 text-violet-700"
                        : "border-slate-200"
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>

              <div className="mt-2">
                <label className="text-xs text-slate-500">
                  Điểm trung bình môn (nếu biết)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={current?.averageScore ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    updateSubject(subject.id, {
                      averageScore:
                        value === "" ? null : Number(value),
                    });
                  }}
                  placeholder="Ví dụ: 8.5"
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2 outline-none focus:border-violet-600"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border px-6 py-3 font-semibold"
        >
          Quay lại
        </button>

        <button
          type="button"
          onClick={onNext}
          className="rounded-xl bg-violet-600 px-8 py-3 font-semibold text-white"
        >
          Tiếp tục
        </button>
      </div>
    </section>
  );
}
