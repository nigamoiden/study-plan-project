
"use client";

import type {
  Question,
  ShortAnswerAnswer,
} from "../types/question.types";

interface Props {
  question: Question;
  answer?: ShortAnswerAnswer;
  onChange: (answer: ShortAnswerAnswer) => void;
  disabled?: boolean;
}

export default function ShortAnswerQuestion({
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

      <input
        type="text"
        value={answer?.answer || ""}
        disabled={disabled}
        maxLength={2000}
        onChange={(event) =>
          onChange({
            questionId: question.id,
            type: "short_answer",
            answer: event.target.value,
          })
        }
        placeholder="Nhập câu trả lời..."
        className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
      />
    </div>
  );
}
