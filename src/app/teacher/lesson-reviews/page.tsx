"use client";

import { useEffect, useState } from "react";

type ReviewDetail = {
  exerciseId: string;
  type: string;
  answer: string;
  score: number;
  feedback: string;
  explanation: string;
  correctAnswer: string | null;
};

type Review = {
  id: string;
  studentName: string;
  lessonTitle: string;
  subject: string;
  aiScore: number;
  status: string;
  details: ReviewDetail[];
};

export default function TeacherLessonReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/teacher/lesson-reviews", { credentials: "same-origin" });
      const data = await response.json() as { reviews?: Review[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Không thể tải danh sách chấm bài.");
      setReviews(data.reviews ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải danh sách chấm bài.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch("/api/teacher/lesson-reviews", { credentials: "same-origin" })
      .then(async (response) => {
        const data = await response.json() as { reviews?: Review[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Không thể tải danh sách chấm bài.");
        if (active) setReviews(data.reviews ?? []);
      })
      .catch((cause) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Không thể tải danh sách chấm bài.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function revise(reviewId: string, exerciseId: string, score: number, feedback: string) {
    setSaving(`${reviewId}-${exerciseId}`);
    setError("");
    try {
      const response = await fetch(`/api/teacher/lesson-reviews/${reviewId}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId, score, feedback }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Không thể gửi điểm chỉnh sửa.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể gửi điểm chỉnh sửa.");
    } finally {
      setSaving("");
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <p className="text-sm font-semibold text-violet-600">AI Grading Review</p>
      <h1 className="mt-2 text-3xl font-bold">Xác nhận bài tự luận</h1>
      {loading && <p className="mt-6 text-slate-600">Đang tải...</p>}
      {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {!loading && reviews.filter((review) => review.status === "pending_review").length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed p-8 text-center text-slate-600">
          Không có bài cần xác nhận.
        </p>
      )}

      <div className="mt-6 space-y-6">
        {reviews.filter((review) => review.status === "pending_review").map((review) => (
          <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="font-bold">{review.studentName}</p>
                <p className="text-sm text-slate-500">{review.lessonTitle} · {review.subject}</p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                AI: {review.aiScore}%
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {review.details.filter((detail) => detail.type === "essay").map((detail, index) => (
                <ReviewEditor
                  key={detail.exerciseId}
                  index={index}
                  detail={detail}
                  saving={saving === `${review.id}-${detail.exerciseId}`}
                  onSave={(score, feedback) => void revise(review.id, detail.exerciseId, score, feedback)}
                />
              ))}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

function ReviewEditor({
  detail,
  index,
  saving,
  onSave,
}: {
  detail: ReviewDetail;
  index: number;
  saving: boolean;
  onSave: (score: number, feedback: string) => void;
}) {
  const [score, setScore] = useState(detail.score);
  const [feedback, setFeedback] = useState(detail.feedback);

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-sm font-semibold text-violet-700">Câu tự luận {index + 1}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">Bài làm: {detail.answer}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-500">
        Đáp án/ý chính: {detail.correctAnswer ?? "Theo rubric của bài"}
      </p>
      <label className="mt-4 block text-sm font-semibold">
        Điểm
        <input
          type="number"
          min={0}
          max={100}
          value={score}
          onChange={(event) => setScore(Number(event.target.value))}
          className="mt-1 w-24 rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>
      <label className="mt-3 block text-sm font-semibold">
        Nhận xét gửi học sinh
        <textarea
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          rows={4}
          className="mt-1 w-full rounded-lg border border-slate-300 p-3"
        />
      </label>
      <button
        type="button"
        disabled={saving}
        onClick={() => onSave(score, feedback)}
        className="mt-3 rounded-lg bg-violet-700 px-4 py-2 font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Đang gửi..." : "Xác nhận và gửi học sinh"}
      </button>
    </div>
  );
}
