
import type {
  AssessmentResult,
} from "../types/assessment.types";

export const scoringService = {
  async getResult(attemptId: string): Promise<AssessmentResult> {
    const response = await fetch(
      `/api/attempts/${encodeURIComponent(attemptId)}/result`,
      {
        credentials: "same-origin",
        cache: "no-store",
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || "Không thể tải kết quả bài kiểm tra."
      );
    }

    return data.result as AssessmentResult;
  },
};
