
import type {
  AssessmentAttempt,
  StartAttemptResponse,
  SubmitAttemptResponse,
} from "../types/assessment.types";

import type { QuestionAnswer } from "../types/question.types";

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
    throw new Error(data.message || "Thao tác không thành công.");
  }

  return data as T;
}

export const attemptService = {
  async start(assessmentId: string): Promise<AssessmentAttempt> {
    const data = await request<StartAttemptResponse>(
      `/api/assessment/${encodeURIComponent(assessmentId)}/attempts`,
      {
        method: "POST",
      }
    );

    return data.attempt;
  },

  async get(attemptId: string): Promise<AssessmentAttempt> {
    const data = await request<{ attempt: AssessmentAttempt }>(
      `/api/attempts/${encodeURIComponent(attemptId)}`
    );

    return data.attempt;
  },

  async saveAnswers(
    attemptId: string,
    answers: QuestionAnswer[]
  ): Promise<void> {
    await request<{ success: boolean }>(
      `/api/attempts/${encodeURIComponent(attemptId)}/answers`,
      {
        method: "PUT",
        body: JSON.stringify({ answers }),
      }
    );
  },

  async submit(attemptId: string): Promise<SubmitAttemptResponse> {
    return request<SubmitAttemptResponse>(
      `/api/attempts/${encodeURIComponent(attemptId)}/answers`,
      {
        method: "POST",
        body: JSON.stringify({ attemptId }),
      }
    );
  },
};
