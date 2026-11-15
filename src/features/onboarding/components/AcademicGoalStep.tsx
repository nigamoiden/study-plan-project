
"use client";

import type {
  OnboardingData,
  OnboardingStepProps,
} from "../types/onboarding.types";

const goalOptions = [
  "Thi tốt nghiệp THPT",
  "Thi đánh giá năng lực",
  "Xét tuyển đại học",
  "Cải thiện điểm số trên lớp",
  "Xây dựng kiến thức nền tảng",
];

export default function AcademicGoalStep({
  data,
  onChange,
  onNext,
}: OnboardingStepProps) {
  const goal = data.academicGoal;

  function updateGoal(
    values: Partial<OnboardingData["academicGoal"]>
  ) {
    onChange({
      academicGoal: {
        ...goal,
        ...values,
      },
    });
  }

  function toggleGoal(value: string) {
    const goals = goal.goals.includes(value)
      ? goal.goals.filter((item) => item !== value)
      : [...goal.goals, value];

    updateGoal({ goals });
  }

  return (
    <section>
      <p className="mb-2 text-sm font-semibold text-violet-600">
        BƯỚC 01
      </p>

      <h2 className="text-2xl font-bold">
        Bạn đang hướng đến điều gì?
      </h2>

      <p className="mb-8 mt-2 text-slate-500">
        Mục tiêu của bạn sẽ giúp hệ thống xây dựng lộ trình
        học tập phù hợp.
      </p>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Ngành học mong muốn *
          </label>

          <input
            value={goal.targetMajor}
            onChange={(event) =>
              updateGoal({ targetMajor: event.target.value })
            }
            placeholder="Ví dụ: Công nghệ thông tin"
            className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-violet-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Trường đại học mong muốn
          </label>

          <input
            value={goal.targetUniversity}
            onChange={(event) =>
              updateGoal({
                targetUniversity: event.target.value,
              })
            }
            placeholder="Ví dụ: Đại học Bách khoa TP.HCM"
            className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-violet-600"
          />
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">
            Mục tiêu học tập của bạn
          </p>

          <div className="space-y-2">
            {goalOptions.map((item) => {
              const checked = goal.goals.includes(item);

              return (
                <label
                  key={item}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                    checked
                      ? "border-violet-600 bg-violet-50"
                      : "border-slate-200 hover:border-violet-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleGoal(item)}
                    className="h-4 w-4 accent-violet-600"
                  />
                  <span className="text-sm">{item}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          disabled={goal.targetMajor.trim().length < 2}
          onClick={onNext}
          className="rounded-xl bg-violet-600 px-8 py-3 font-semibold text-white disabled:opacity-40"
        >
          Tiếp tục
        </button>
      </div>
    </section>
  );
}
