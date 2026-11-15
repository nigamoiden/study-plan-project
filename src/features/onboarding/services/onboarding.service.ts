
import { onboardingSchema } from "../schemas/onboarding.schema";
import type {
  OnboardingData,
  OnboardingSaveResponse,
} from "../types/onboarding.types";

export async function saveOnboarding(
  data: OnboardingData
): Promise<OnboardingSaveResponse> {
  const validation = onboardingSchema.safeParse(data);

  if (!validation.success) {
    throw new Error(
      validation.error.issues[0]?.message ??
      "Thông tin onboarding không hợp lệ"
    );
  }

  const response = await fetch("/api/onboarding", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validation.data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "Không thể lưu hồ sơ học tập"
    );
  }

  return result;
}
