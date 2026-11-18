"use client";

import { useEffect, useState } from "react";

type ResultMessage = {
  id: string;
  title: string;
  message: string;
  score?: number;
};

export default function MasteryOverview() {
  const [results, setResults] = useState<ResultMessage[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/inbox", { credentials: "same-origin" })
      .then(async (response) => {
        const data = await response.json() as { messages?: ResultMessage[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Không thể tải kết quả.");
        if (active) setResults(data.messages ?? []);
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : "Không thể tải kết quả.");
      });
    return () => { active = false; };
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">Kết quả</p>
      <h1 className="mt-2 text-3xl font-bold">Bài đã chấm và phản hồi</h1>
      {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      <div className="mt-6 space-y-4">
        {results.map((result) => (
          <article key={result.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex justify-between gap-3">
              <h2 className="font-bold">{result.title}</h2>
              {typeof result.score === "number" && <span className="font-bold text-violet-700">{result.score}%</span>}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-slate-600">{result.message}</p>
          </article>
        ))}
        {!error && results.length === 0 && (
          <p className="rounded-2xl border border-dashed p-8 text-center text-slate-600">Chưa có kết quả được gửi.</p>
        )}
      </div>
    </main>
  );
}