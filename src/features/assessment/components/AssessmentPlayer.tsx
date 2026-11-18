
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  Assessment,
  AssessmentAttempt,
  AssessmentResult,
} from "../types/assessment.types";

import type {
  QuestionAnswer,
} from "../types/question.types";

import { assessmentService } from "../services/assessment.service";
import { attemptService } from "../services/attempt.service";
import { scoringService } from "../services/scoring.service";

import QuestionRenderer from "./QuestionRenderer";
import AssessmentTimer from "./AssessmentTimer";
import AssessmentResultComponent from "./AssessmentResult";

interface Props {
  assessmentId: string;
  onComplete?: (result: AssessmentResult) => void;
}

type PlayerStatus =
  | "loading"
  | "ready"
  | "submitting"
  | "completed"
  | "error";

export default function AssessmentPlayer({
  assessmentId,
  onComplete,
}: Props) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [status, setStatus] = useState<PlayerStatus>("loading");
  const [error, setError] = useState("");

  const submittedRef = useRef(false);
  const answersRef = useRef<QuestionAnswer[]>([]);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        setStatus("loading");
        setError("");

        const [loadedAssessment, loadedAttempt] = await Promise.all([
          assessmentService.getAssessment(assessmentId),
          attemptService.start(assessmentId),
        ]);

        if (cancelled) return;

        setAssessment(loadedAssessment);
        setAttempt(loadedAttempt);
        setAnswers(loadedAttempt.answers || []);
        answersRef.current = loadedAttempt.answers || [];

        if (loadedAttempt.status === "submitted" ||
            loadedAttempt.status === "graded") {
          const loadedResult = await scoringService.getResult(
            loadedAttempt.id
          );

          if (cancelled) return;

          setResult(loadedResult);
          setStatus("completed");
          submittedRef.current = true;
          return;
        }

        setStatus("ready");
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể khởi tạo bài kiểm tra."
          );
          setStatus("error");
        }
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, [assessmentId]);

  const saveAnswers = useCallback(
    (nextAnswers: QuestionAnswer[]) => {
      if (!attempt || submittedRef.current) {
        return Promise.resolve();
      }

      const snapshot = [...nextAnswers];

      saveQueueRef.current = saveQueueRef.current
        .catch(() => undefined)
        .then(() =>
          attemptService.saveAnswers(attempt.id, snapshot)
        );

      return saveQueueRef.current;
    },
    [attempt]
  );

  const handleAnswerChange = useCallback(
    (answer: QuestionAnswer) => {
      if (submittedRef.current || status !== "ready") return;

      const nextAnswers = [
        ...answersRef.current.filter(
          (item) => item.questionId !== answer.questionId
        ),
        answer,
      ];

      answersRef.current = nextAnswers;
      setAnswers(nextAnswers);

      void saveAnswers(nextAnswers).catch((err) => {
        setError(
          err instanceof Error
            ? `Không thể lưu câu trả lời: ${err.message}`
            : "Không thể lưu câu trả lời."
        );
      });
    },
    [saveAnswers, status]
  );

  const handleSubmit = useCallback(async () => {
    if (!attempt || submittedRef.current || status === "submitting") {
      return;
    }

    submittedRef.current = true;
    setStatus("submitting");
    setError("");

    try {
      await saveQueueRef.current;

      await attemptService.saveAnswers(
        attempt.id,
        answersRef.current
      );

      await attemptService.submit(attempt.id);

      const finalResult = await scoringService.getResult(attempt.id);

      setResult(finalResult);
      setStatus("completed");
      onComplete?.(finalResult);
    } catch (err) {
      submittedRef.current = false;
      setStatus("ready");

      setError(
        err instanceof Error
          ? err.message
          : "Không thể nộp bài kiểm tra."
      );
    }
  }, [attempt, status, onComplete]);

  const handleTimeUp = useCallback(() => {
    void handleSubmit();
  }, [handleSubmit]);

  if (status === "loading") {
    return (
      <div className="p-10 text-center text-gray-500">
        Đang tải bài kiểm tra...
      </div>
    );
  }

  if (status === "error" && !assessment) {
    return (
      <div className="rounded-xl bg-red-50 p-5 text-red-700">
        {error}
      </div>
    );
  }

  if (status === "completed" && result) {
    return (
      <AssessmentResultComponent
        result={result}
      />
    );
  }

  if (!assessment || !attempt) return null;

  const questions = assessment.questions;
  const currentQuestion = questions[currentIndex];

  const currentAnswer = answers.find(
    (item) => item.questionId === currentQuestion?.id
  );

  const answeredCount = answers.filter((answer) =>
    questions.some((question) => question.id === answer.questionId)
  ).length;

  const isSubmitting = status === "submitting";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 md:flex-row md:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {assessment.title}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {assessment.subject} · {questions.length} câu hỏi
          </p>
        </div>

        <AssessmentTimer
          endsAt={attempt.endsAt}
          onTimeUp={handleTimeUp}
        />
      </header>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_240px]">
        <main className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 md:p-7">
          {currentQuestion ? (
            <>
              <div className="mb-6 flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-purple-700">
                  Câu {currentIndex + 1} / {questions.length}
                </div>

                <div className="text-sm text-gray-500">
                  {currentQuestion.points} điểm
                </div>
              </div>

              <QuestionRenderer
                question={currentQuestion}
                answer={currentAnswer}
                onChange={handleAnswerChange}
                disabled={isSubmitting}
              />

              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={currentIndex === 0 || isSubmitting}
                  onClick={() =>
                    setCurrentIndex((index) => index - 1)
                  }
                  className="rounded-xl border border-gray-300 px-5 py-3 disabled:opacity-40"
                >
                  Câu trước
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() =>
                      setCurrentIndex((index) => index + 1)
                    }
                    className="rounded-xl bg-purple-700 px-5 py-3 font-medium text-white hover:bg-purple-800 disabled:opacity-50"
                  >
                    Câu tiếp theo
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="rounded-xl bg-green-600 px-5 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {isSubmitting ? "Đang nộp bài..." : "Nộp bài"}
                  </button>
                )}
              </div>
            </>
          ) : (
            <p>Đề kiểm tra chưa có câu hỏi.</p>
          )}
        </main>

        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold">Danh sách câu hỏi</h2>

          <p className="mt-2 text-sm text-gray-500">
            Đã trả lời {answeredCount}/{questions.length} câu
          </p>

          <div className="mt-4 grid grid-cols-5 gap-2">
            {questions.map((question, index) => {
              const answered = answers.some(
                (answer) => answer.questionId === question.id
              );

              const active = currentIndex === index;

              return (
                <button
                  key={question.id}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex aspect-square items-center justify-center rounded-lg border text-sm font-medium ${
                    active
                      ? "border-purple-700 bg-purple-700 text-white"
                      : answered
                        ? "border-green-300 bg-green-50 text-green-700"
                        : "border-gray-200 bg-gray-50 text-gray-600"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-5 space-y-2 text-xs text-gray-500">
            <p>🟣 Câu đang xem</p>
            <p>🟢 Đã trả lời</p>
            <p>⚪ Chưa trả lời</p>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="mt-6 w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? "Đang nộp..." : "Nộp bài kiểm tra"}
          </button>
        </aside>
      </div>
    </div>
  );
}
