
"use client";

import type {
  Question,
  MultipleChoiceAnswer,
} from "../types/question.types";

interface Props {
  question: Question;
  answer?: MultipleChoiceAnswer;
  onChange: (answer: MultipleChoiceAnswer) => void;
  disabled?: boolean;
}

export default function MultipleChoiceQuestion({
  question,
  answer,
  onChange,
  disabled = false,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="font-medium text-gray-900">
        {question.content}
      </div>

      <div className="space-y-3">
        {(question.options || []).map((option, index) => {
          const selected = answer?.selectedOptionId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() =>
                onChange({
                  questionId: question.id,
                  type: "multiple_choice",
                  selectedOptionId: option.id,
                })
              }
              className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${
                selected
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm ${
                  selected
                    ? "border-purple-600 bg-purple-600 text-white"
                    : "border-gray-300"
                }`}
              >
                {String.fromCharCode(65 + index)}
              </span>

              <span>{option.content}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
