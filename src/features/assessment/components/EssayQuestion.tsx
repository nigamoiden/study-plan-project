
"use client";

import type {
  Question,
  EssayAnswer,
} from "../types/question.types";

interface Props {
  question: Question;
  answer?: EssayAnswer;
  onChange: (answer: EssayAnswer) => void;
  disabled?: boolean;
}

export default function EssayQuestion({
  question,
  answer,
  onChange,
  disabled = false,
}: Props) {
  const text = answer?.answer || "";

  return (
    <div className="space-y-4">
      <div className="font-medium text-gray-900">
        {question.content}
      </div>

      <textarea
        value={text}
        disabled={disabled}
        maxLength={20000}
        rows={12}
        onChange={(event) =>
          onChange({
            questionId: question.id,
            type: "essay",
            answer: event.target.value,
          })
        }
        placeholder="Trình bày lời giải của bạn..."
        className="w-full resize-y rounded-xl border border-gray-300 p-4 leading-7 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-100"
      />

      <div className="text-right text-sm text-gray-500">
        {text.length.toLocaleString("vi-VN")} / 20.000 ký tự
      </div>
    </div>
  );
}
