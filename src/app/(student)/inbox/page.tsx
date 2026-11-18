"use client";

import { useEffect, useState } from "react";

type InboxMessage = {
  id: string;
  title: string;
  message: string;
  score?: number;
  status: string;
  createdAt: string | null;
  read?: boolean;
};

export default function InboxPage() {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/inbox", { credentials: "same-origin" })
      .then(async (response) => {
        const data = await response.json() as { messages?: InboxMessage[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Không thể tải hộp thư.");
        setMessages(data.messages ?? []);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Không thể tải hộp thư."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">Hộp thư</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Thông báo học tập</h1>

      {loading && <p className="mt-6 text-slate-600">Đang tải thư...</p>}
      {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {!loading && !error && messages.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-600">
          Chưa có thông báo chấm bài.
        </p>
      )}

      <div className="mt-6 space-y-4">
        {messages.map((message) => (
          <article key={message.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="font-bold text-slate-900">{message.title}</h2>
              {typeof message.score === "number" && (
                <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-bold text-violet-700">
                  {message.score}%
                </span>
              )}
            </div>
            <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">{message.message}</p>
            {message.createdAt && (
              <p className="mt-3 text-xs text-slate-500">
                {new Date(message.createdAt).toLocaleString("vi-VN")}
              </p>
            )}
            {!message.read && (
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/inbox", {
                    method: "PATCH",
                    credentials: "same-origin",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ messageId: message.id, read: true }),
                  });
                  setMessages((current) =>
                    current.map((item) =>
                      item.id === message.id ? { ...item, read: true } : item
                    )
                  );
                }}
                className="mt-3 rounded-lg border border-violet-200 px-3 py-1.5 text-sm font-semibold text-violet-700"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
