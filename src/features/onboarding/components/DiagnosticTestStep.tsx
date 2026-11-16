
"use client";

import { useEffect, useState } from "react";

import type {
  DiagnosticAnswer,
  DiagnosticQuestion,
  OnboardingStepProps,
} from "../types/onboarding.types";

interface Props extends OnboardingStepProps {
  onSkip: () => void;
}

export default function DiagnosticTestStep({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
}: Props) {
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const answers = data.diagnosticTest.answers;

  useEffect(() => {
    let active = true;

    fetch("/api/onboarding/diagnostic", { credentials: "same-origin" })
      .then(async (response) => {
        const result = (await response.json()) as {
          questions?: DiagnosticQuestion[];
          error?: string;
        };
        if (!response.ok || !result.questions) {
          throw new Error(result.error ?? "Không thể tải bài kiểm tra.");
        }
        if (active) setQuestions(result.questions);
      })
      .catch((cause: unknown) => {
        if (active) {
          setLoadError(
            cause instanceof Error ? cause.message : "Không thể tải bài kiểm tra."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function selectAnswer(
    questionId: string,
    selectedAnswer: number
  ) {
    const nextAnswers: DiagnosticAnswer[] = [
      ...answers.filter((item) => item.questionId !== questionId),
      { questionId, selectedAnswer },
    ];

    onChange({
      diagnosticTest: {
        answers: nextAnswers,
        totalQuestions: questions.length,
        correctAnswers: 0,
        score: 0,
      },
    });
  }

  const answeredCount = answers.filter(
    (item) => item.selectedAnswer !== null
  ).length;

  return (
    <section>
      <p className="mb-2 text-sm font-semibold text-violet-600">
        BƯỚC 04
      </p>

      <h2 className="text-2xl font-bold">
        Kiểm tra kiến thức đầu vào
      </h2>

      <p className="mb-6 mt-2 text-slate-500">
        Bài kiểm tra ngắn giúp chúng tôi hiểu rõ hơn về
        năng lực hiện tại của bạn. Đây là bài đánh giá thử,
        không ảnh hưởng đến điểm số ở trường.
      </p>

      {loading && (
        <p role="status" className="mb-4 text-sm text-slate-600">
          Đang tải câu hỏi...
        </p>
      )}
      {loadError && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {loadError}
        </p>
      )}

      <div className="mb-6 flex items-center justify-between rounded-xl bg-violet-50 p-4">
        <span className="text-sm font-medium text-violet-800">
          Tiến độ hoàn thành
        </span>
        <span className="font-bold text-violet-700">
          {answeredCount}/{questions.length}
        </span>
      </div>

      <div className="space-y-7">
        {questions.map((question, index) => {
          const selected = answers.find(
            (item) => item.questionId === question.id
          )?.selectedAnswer;

          return (
            <div
              key={question.id}
              className="rounded-xl border border-slate-200 p-5"
            >
              <p className="mb-4 font-semibold">
                Câu {index + 1}. {question.question}
              </p>

              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <button
                    type="button"
                    key={optionIndex}
                    onClick={() =>
                      selectAnswer(question.id, optionIndex)
                    }
                    className={`w-full rounded-lg border p-3 text-left text-sm transition ${
                      selected === optionIndex
                        ? "border-violet-600 bg-violet-50 font-semibold text-violet-700"
                        : "border-slate-200 hover:border-violet-300"
                    }`}
                  >
                    <span className="mr-2 font-semibold">
                      {String.fromCharCode(65 + optionIndex)}.
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-xs leading-5 text-slate-400">
        Bạn có thể bỏ qua bài kiểm tra và thực hiện sau.
        Kết quả bài kiểm tra thử chưa thay thế đánh giá năng lực
        chuyên sâu.
      </p>

      <div className="mt-8 flex flex-wrap justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border px-6 py-3 font-semibold"
        >
          Quay lại
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="rounded-xl border px-5 py-3 font-semibold text-slate-600"
          >
            Để sau
          </button>

          <button
            type="button"
            disabled={loading || Boolean(loadError) || answeredCount !== questions.length}
            onClick={onNext}
            className="rounded-xl bg-violet-600 px-7 py-3 font-semibold text-white disabled:opacity-40"
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </section>
  );
}
