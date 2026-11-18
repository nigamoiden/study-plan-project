
"use client";

import type {
  AssessmentResult as AssessmentResultType,
} from "../types/assessment.types";

interface Props {
  result: AssessmentResultType;
  onContinue?: () => void;
}

export default function AssessmentResult({
  result,
  onContinue,
}: Props) {
  const isPending = result.gradingStatus !== "graded";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <div className="text-sm font-medium text-gray-500">
          KẾT QUẢ BÀI KIỂM TRA
        </div>

        <div className="my-5 text-5xl font-bold text-purple-700">
          {result.scorePercentage.toFixed(1)}%
        </div>

        <div className="text-gray-600">
          {result.earnedPoints} / {result.totalPoints} điểm
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Trả lời đúng {result.correctAnswers} /{" "}
          {result.totalQuestions} câu
        </div>

        {isPending && (
          <div className="mt-5 rounded-xl bg-yellow-50 p-3 text-sm text-yellow-800">
            Một số câu tự luận đang chờ giáo viên hoặc hệ thống AI chấm điểm.
            Kết quả hiện tại có thể chưa phải điểm cuối cùng.
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          Chi tiết từng câu
        </h2>

        {result.questionResults.map((item, index) => (
          <div
            key={item.questionId}
            className="rounded-xl border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">
                Câu {index + 1}
              </span>

              <span className="text-sm text-gray-600">
                {item.earnedPoints} / {item.maxPoints} điểm
              </span>
            </div>

            <div className="mt-2 text-sm">
              {item.gradingStatus === "pending" ? (
                <span className="text-yellow-700">
                  Đang chờ chấm
                </span>
              ) : item.isCorrect ? (
                <span className="text-green-700">
                  Trả lời chính xác
                </span>
              ) : (
                <span className="text-red-600">
                  Chưa chính xác
                </span>
              )}
            </div>

            {item.feedback && (
              <p className="mt-2 text-sm text-gray-600">
                {item.feedback}
              </p>
            )}
          </div>
        ))}
      </div>

      {onContinue && (
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white hover:bg-purple-800"
        >
          Tiếp tục
        </button>
      )}
    </div>
  );
}
