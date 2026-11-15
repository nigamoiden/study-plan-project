
"use client";

import type {
  Question,
  TrueFalseAnswer,
} from "../types/question.types";

interface Props {
  question: Question;
  answer?: TrueFalseAnswer;
  onChange: (answer: TrueFalseAnswer) => void;
  disabled?: boolean;
}

export default function TrueFalseQuestion({
  question,
  answer,
  onChange,
  disabled = false,
}: Props) {
  const choices = [
    { value: true, label: "Đúng" },
    { value: false, label: "Sai" },
  ];

  return (
    <div className="space-y-4">
      <div className="font-medium text-gray-900">
        {question.content}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {choices.map((choice) => {
          const selected = answer?.selectedValue === choice.value;

          return (
            <button
              key={String(choice.value)}
              type="button"
              disabled={disabled}
              onClick={() =>
                onChange({
                  questionId: question.id,
                  type: "true_false",
                  selectedValue: choice.value,
                })
              }
              className={`rounded-xl border p-5 font-medium transition ${
                selected
                  ? "border-purple-600 bg-purple-50 text-purple-700"
                  : "border-gray-200 hover:border-purple-300"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {choice.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
