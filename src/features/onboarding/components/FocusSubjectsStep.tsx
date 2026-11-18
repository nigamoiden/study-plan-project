"use client";

import type {
  OnboardingData,
  OnboardingStepProps,
} from "../types/onboarding.types";
import { SUBJECT_OPTIONS } from "@/features/learning-content/constants";

export default function FocusSubjectsStep({
  data,
  onChange,
  onNext,
  onBack,
}: OnboardingStepProps) {
  function toggleSubject(subject: OnboardingData["focusSubjects"][number]) {
    const focusSubjects = data.focusSubjects.includes(subject)
      ? data.focusSubjects.filter((item) => item !== subject)
      : [...data.focusSubjects, subject];

    onChange({ focusSubjects });
  }

  return (
    <section>
      <p className="mb-2 text-sm font-semibold text-violet-600">
        BƯỚC 05
      </p>
      <h2 className="text-2xl font-bold">
        Bạn muốn tập trung vào môn nào?
      </h2>
      <p className="mb-6 mt-2 text-slate-500">
        Sau khảo sát, hãy chọn các môn bạn muốn học. Thư viện sẽ chỉ hiện bài
        học thuộc những môn đã chọn; bạn có thể đổi lựa chọn sau này.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {SUBJECT_OPTIONS.map(({ value, label }) => {
          const checked = data.focusSubjects.includes(value);

          return (
            <label
              key={value}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                checked
                  ? "border-violet-600 bg-violet-50"
                  : "border-slate-200 hover:border-violet-300"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleSubject(value)}
                className="h-4 w-4 accent-violet-600"
              />
              <span className="font-medium">{label}</span>
            </label>
          );
        })}
      </div>

      {data.focusSubjects.length === 0 && (
        <p className="mt-3 text-sm text-amber-700" role="status">
          Chọn ít nhất một môn để tiếp tục.
        </p>
      )}

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-slate-300 px-6 py-3 font-semibold"
        >
          Quay lại
        </button>
        <button
          type="button"
          disabled={data.focusSubjects.length === 0}
          onClick={onNext}
          className="rounded-xl bg-violet-600 px-8 py-3 font-semibold text-white disabled:opacity-40"
        >
          Tiếp tục
        </button>
      </div>
    </section>
  );
}
