
"use client";

import type {
  DiagnosticAnswer,
  DiagnosticQuestion,
  OnboardingData,
  OnboardingStepProps,
} from "../types/onboarding.types";

const questions: DiagnosticQuestion[] = [
  {
    id: "math-001",
    subject: "math",
    question: "Đạo hàm của hàm số f(x) = x² là gì?",
    options: ["x", "2x", "x²", "2"],
    correctAnswer: 1,
    explanation: "Theo quy tắc đạo hàm lũy thừa, (x²)' = 2x.",
  },
  {
    id: "math-002",
    subject: "math",
    question: "Giá trị của lim (x² - 1)/(x - 1) khi x tiến đến 1 là:",
    options: ["0", "1", "2", "Không tồn tại"],
    correctAnswer: 2,
    explanation:
      "Phân tích x² - 1 = (x - 1)(x + 1), giới hạn bằng 2.",
  },
  {
    id: "math-003",
    subject: "math",
    question: "Nguyên hàm của 2x là:",
    options: ["x² + C", "2x² + C", "x + C", "2 + C"],
    correctAnswer: 0,
    explanation: "Vì (x² + C)' = 2x.",
  },
  {
    id: "math-004",
    subject: "math",
    question: "Nghiệm của phương trình x² - 5x + 6 = 0 là:",
    options: [
      "x = 1 và x = 6",
      "x = 2 và x = 3",
      "x = -2 và x = -3",
      "x = 0 và x = 5",
    ],
    correctAnswer: 1,
    explanation: "Ta có x² - 5x + 6 = (x - 2)(x - 3).",
  },
  {
    id: "math-005",
    subject: "math",
    question: "Đạo hàm của sin(x) là:",
    options: ["-sin(x)", "cos(x)", "-cos(x)", "tan(x)"],
    correctAnswer: 1,
    explanation: "(sin x)' = cos x.",
  },
];

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
  const answers = data.diagnosticTest.answers;

  function selectAnswer(
    questionId: string,
    selectedAnswer: number
  ) {
    const nextAnswers: DiagnosticAnswer[] = [
      ...answers.filter((item) => item.questionId !== questionId),
      { questionId, selectedAnswer },
    ];

    const correctAnswers = nextAnswers.filter((answer) => {
      const question = questions.find(
        (item) => item.id === answer.questionId
      );

      return (
        question &&
        answer.selectedAnswer === question.correctAnswer
      );
    }).length;

    const answeredCount = nextAnswers.length;

    const result = {
      answers: nextAnswers,
      totalQuestions: questions.length,
      correctAnswers,
      score: Math.round(
        (correctAnswers / questions.length) * 100
      ),
    };

    onChange({ diagnosticTest: result });
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
            disabled={answeredCount !== questions.length}
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
