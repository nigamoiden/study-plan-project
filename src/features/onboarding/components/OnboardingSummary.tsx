
"use client";

import type { OnboardingData } from "../types/onboarding.types";

interface Props {
  data: OnboardingData;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}

const subjectLabels: Record<string, string> = {
  math: "Toán học",
  physics: "Vật lý",
  chemistry: "Hóa học",
  biology: "Sinh học",
  english: "Tiếng Anh",
  literature: "Ngữ văn",
  history: "Lịch sử",
};

const levelLabels: Record<string, string> = {
  weak: "Yếu",
  average: "Trung bình",
  good: "Khá",
  excellent: "Tốt",
};

const timeLabels: Record<string, string> = {
  morning: "Buổi sáng",
  afternoon: "Buổi chiều",
  evening: "Buổi tối",
  flexible: "Linh hoạt",
};

export default function OnboardingSummary({
  data,
  onBack,
  onSubmit,
  loading,
}: Props) {
  const history = data.academicHistory;
  const frequency = data.studyFrequency;
  const diagnostic = data.diagnosticTest;

  return (
    <section>
      <p className="mb-2 text-sm font-semibold text-violet-600">
        BƯỚC 06
      </p>

      <h2 className="text-2xl font-bold">
        Hồ sơ học tập của bạn
      </h2>

      <p className="mb-8 mt-2 text-slate-500">
        Kiểm tra lại thông tin trước khi chúng tôi thiết lập
        hồ sơ học tập.
      </p>

      <div className="space-y-5">
        <div className="rounded-xl border border-slate-200 p-5">
          <h3 className="mb-3 font-bold">
            Định hướng học tập
          </h3>
          <p>
            <span className="text-slate-500">Ngành học: </span>
            {data.academicGoal.targetMajor}
          </p>
          <p className="mt-2">
            <span className="text-slate-500">Trường: </span>
            {data.academicGoal.targetUniversity || "Chưa xác định"}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {data.academicGoal.goals.map((goal) => (
              <span
                key={goal}
                className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700"
              >
                {goal}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-5">
          <h3 className="mb-3 font-bold">
            Kết quả học tập hiện tại
          </h3>

          <p className="mb-4">
            Lớp {history.schoolYear}
          </p>

          <div className="space-y-3">
            {history.subjects.map((subject) => (
              <div
                key={subject.subject}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span>{subjectLabels[subject.subject]}</span>
                <span className="text-right font-medium">
                  {levelLabels[subject.level]}
                  {subject.averageScore !== null
                    ? ` · ${subject.averageScore}/10`
                    : ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-5">
          <h3 className="mb-3 font-bold">
            Thói quen học tập
          </h3>

          <p>
            {frequency.studyDaysPerWeek} ngày/tuần
          </p>
          <p className="mt-2">
            {frequency.studyMinutesPerDay} phút/ngày
          </p>
          <p className="mt-2">
            {timeLabels[frequency.preferredStudyTime]}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 p-5">
          <h3 className="mb-3 font-bold">
            Bài kiểm tra đầu vào
          </h3>

          {diagnostic.answers.length === 0 ? (
            <p className="text-sm text-slate-500">
              Bạn đã chọn thực hiện bài kiểm tra sau.
            </p>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                Bài làm sẽ được chấm an toàn ở máy chủ sau khi bạn hoàn tất.
              </p>
            </>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 p-5">
          <h3 className="mb-3 font-bold">Môn cần tập trung</h3>
          <div className="flex flex-wrap gap-2">
            {data.focusSubjects.map((subject) => (
              <span
                key={subject}
                className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700"
              >
                {subjectLabels[subject]}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="rounded-xl border px-6 py-3 font-semibold"
        >
          Quay lại
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="rounded-xl bg-violet-600 px-7 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : "Hoàn tất thiết lập"}
        </button>
      </div>
    </section>
  );
}
