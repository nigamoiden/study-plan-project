import type {
  PracticeAnswer,
  PracticeGradingResult,
  PracticeItem,
} from "../types/practice.types";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "Không thể kết nối tới dịch vụ luyện tập."
    );
  }

  return data as T;
}

export const practiceService = {
  async list(): Promise<PracticeItem[]> {
    const data = await request<{ items: PracticeItem[] }>("/api/practice");
    return data.items;
  },

  async get(practiceId: string): Promise<PracticeItem> {
    const data = await request<{ practice: PracticeItem }>(
      `/api/practice/${encodeURIComponent(practiceId)}`
    );
    return data.practice;
  },

  async submit(
    practiceId: string,
    answers: PracticeAnswer[]
  ): Promise<PracticeGradingResult> {
    const data = await request<{ result: PracticeGradingResult }>(
      `/api/practice/${encodeURIComponent(practiceId)}/submit`,
      {
        method: "POST",
        body: JSON.stringify({ answers }),
      }
    );
    return data.result;
  },
};
