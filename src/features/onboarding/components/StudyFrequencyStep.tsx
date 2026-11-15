
"use client";

import type {
  OnboardingData,
  OnboardingStepProps,
} from "../types/onboarding.types";

const studyTimes = [
  { value: "morning", label: "Buổi sáng", description: "5:00 – 11:00" },
  { value: "afternoon", label: "Buổi chiều", description: "11:00 – 17:00" },
  { value: "evening", label: "Buổi tối", description: "17:00 – 23:00" },
  { value: "flexible", label: "Linh hoạt", description: "Không cố định" },
] as const;

export default function StudyFrequencyStep({
  data,
  onChange,
  onNext,
  onBack,
}: OnboardingStepProps) {
  const frequency = data.studyFrequency;

  function update(
    values: Partial<OnboardingData["studyFrequency"]>
  ) {
    onChange({
      studyFrequency: {
        ...frequency,
        ...values,
      },
    });
  }

  return (
    <section>
      <p className="mb-2 text-sm font-semibold text-violet-600">
        BƯỚC 03
      </p>

      <h2 className="text-2xl font-bold">
        Xây dựng thói quen học tập
      </h2>

      <p className="mb-8 mt-2 text-slate-500">
        Chúng tôi sẽ sử dụng thông tin này để phân bổ khối
        lượng học phù hợp với lịch trình của bạn.
      </p>

      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <label className="font-semibold">
            Số ngày học mỗi tuần
          </label>
          <span className="font-bold text-violet-600">
            {frequency.studyDaysPerWeek} ngày
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="7"
          value={frequency.studyDaysPerWeek}
          onChange={(event) =>
            update({
              studyDaysPerWeek: Number(event.target.value),
            })
          }
          className="w-full accent-violet-600"
        />

        <div className="flex justify-between text-xs text-slate-400">
          <span>1 ngày</span>
          <span>7 ngày</span>
        </div>
      </div>

      <div className="mb-8">
        <label className="mb-3 block font-semibold">
          Thời gian học mỗi ngày
        </label>

        <div className="grid grid-cols-2 gap-3">
          {[30, 45, 60, 90, 120, 180].map((minutes) => (
            <button
              type="button"
              key={minutes}
              onClick={() =>
                update({ studyMinutesPerDay: minutes })
              }
              className={`rounded-xl border p-4 font-semibold ${
                frequency.studyMinutesPerDay === minutes
                  ? "border-violet-600 bg-violet-50 text-violet-700"
                  : "border-slate-200"
              }`}
            >
              {minutes} phút
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-3 block font-semibold">
          Thời gian học yêu thích
        </label>

        <div className="grid grid-cols-2 gap-3">
          {studyTimes.map((time) => (
            <button
              type="button"
              key={time.value}
              onClick={() =>
                update({ preferredStudyTime: time.value })
              }
              className={`rounded-xl border p-4 text-left ${
                frequency.preferredStudyTime === time.value
                  ? "border-violet-600 bg-violet-50"
                  : "border-slate-200"
              }`}
            >
              <p className="font-semibold">{time.label}</p>
              <p className="mt-1 text-xs text-slate-500">
                {time.description}
              </p>
            </button>
          ))}
        </div>
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
