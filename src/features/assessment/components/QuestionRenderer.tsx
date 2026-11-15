
"use client";

import type {
  Question,
  QuestionAnswer,
} from "../types/question.types";

import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import TrueFalseQuestion from "./TrueFalseQuestion";
import ShortAnswerQuestion from "./ShortAnswerQuestion";
import EssayQuestion from "./EssayQuestion";

interface Props {
  question: Question;
  answer?: QuestionAnswer;
  onChange: (answer: QuestionAnswer) => void;
  disabled?: boolean;
}

export default function QuestionRenderer({
  question,
  answer,
  onChange,
  disabled = false,
}: Props) {
  switch (question.type) {
    case "multiple_choice":
      return (
        <MultipleChoiceQuestion
          question={question}
          answer={
            answer?.type === "multiple_choice"
              ? answer
              : undefined
          }
          onChange={onChange}
          disabled={disabled}
        />
      );

    case "true_false":
      return (
        <TrueFalseQuestion
          question={question}
          answer={
            answer?.type === "true_false"
              ? answer
              : undefined
          }
          onChange={onChange}
          disabled={disabled}
        />
      );

    case "short_answer":
      return (
        <ShortAnswerQuestion
          question={question}
          answer={
            answer?.type === "short_answer"
              ? answer
              : undefined
          }
          onChange={onChange}
          disabled={disabled}
        />
      );

    case "essay":
      return (
        <EssayQuestion
          question={question}
          answer={
            answer?.type === "essay"
              ? answer
              : undefined
          }
          onChange={onChange}
          disabled={disabled}
        />
      );

    default:
      return (
        <div className="rounded-xl bg-red-50 p-4 text-red-600">
          Dạng câu hỏi chưa được hỗ trợ.
        </div>
      );
  }
}
