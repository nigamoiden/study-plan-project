"use client";

import { useEffect, useState } from "react";

type Question = {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correctAnswer: number;
  active: boolean;
};

export default function QuestionManagement() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState("math");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  async function loadQuestions() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/onboarding-questions", { credentials: "same-origin" });
      const data = await response.json() as { questions?: Question[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Không thể tải câu hỏi.");
      setQuestions(data.questions ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải câu hỏi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/onboarding-questions", { credentials: "same-origin" })
      .then(async (response) => {
        const data = await response.json() as { questions?: Question[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Không thể tải câu hỏi.");
        if (active) setQuestions(data.questions ?? []);
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : "Không thể tải câu hỏi.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function createQuestion() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/onboarding-questions", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          question,
          options: options.filter((option) => option.trim()),
          correctAnswer,
          active: true,
        }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Không thể tạo câu hỏi.");
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer(0);
      await loadQuestions();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tạo câu hỏi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-medium text-violet-600">Khảo sát đầu vào</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">Câu hỏi kiểm tra mới tài khoản</h2>
      </div>

      <div className="mb-6 grid gap-3 rounded-xl border border-slate-200 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <select value={subject} onChange={(event) => setSubject(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2">
            <option value="math">Toán</option>
            <option value="physics">Vật lý</option>
            <option value="chemistry">Hóa học</option>
            <option value="biology">Sinh học</option>
            <option value="english">Tiếng Anh</option>
            <option value="literature">Ngữ văn</option>
            <option value="history">Lịch sử</option>
          </select>
          <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Nội dung câu hỏi" className="rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={option}
              onChange={(event) => setOptions((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
              placeholder={`Lựa chọn ${index + 1}`}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2"
            />
            <button type="button" onClick={() => setCorrectAnswer(index)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${correctAnswer === index ? "bg-emerald-600 text-white" : "border border-slate-300"}`}>
              {correctAnswer === index ? "Đáp án đúng" : "Chọn đáp án"}
            </button>
          </div>
        ))}
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button type="button" disabled={saving} onClick={() => void createQuestion()} className="justify-self-start rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {saving ? "Đang lưu..." : "Đăng câu hỏi"}
        </button>
      </div>

      <div className="space-y-3">
        {loading && <p className="text-sm text-slate-500">Đang tải câu hỏi...</p>}
        {!loading && questions.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            Chưa có câu hỏi khảo sát do admin đăng tải.
          </p>
        )}
        {questions.map((item) => (
          <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">{item.subject}</p>
              <p className="mt-1 font-semibold text-slate-800">{item.question}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
              {item.active ? "Đang dùng" : "Tạm tắt"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
