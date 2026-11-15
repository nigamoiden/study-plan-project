
import type { Assessment } from "../types/assessment.types";

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Không thể tải bài kiểm tra.");
  }

  return data as T;
}

export const assessmentService = {
  async getAssessment(assessmentId: string): Promise<Assessment> {
    const data = await request<{ assessment: Assessment }>(
      `/api/assessments/${encodeURIComponent(assessmentId)}`
    );

    return data.assessment;
  },
};
