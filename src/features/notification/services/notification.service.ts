import type { AppNotification } from "../types/notification.types";

export async function readInboxResponse<T>(
  response: Response,
  fallback: string
): Promise<T> {
  const text = await response.text();
  if (!text.trim()) {
    throw new Error(`${fallback} Máy chủ không trả về dữ liệu.`);
  }

  let data: T & { error?: string };
  try {
    data = JSON.parse(text) as T & { error?: string };
  } catch {
    throw new Error(`${fallback} Phản hồi từ máy chủ không phải JSON hợp lệ.`);
  }

  if (!response.ok) {
    throw new Error(data.error ?? fallback);
  }

  return data;
}

export async function listNotifications(): Promise<AppNotification[]> {
  const response = await fetch("/api/inbox", { credentials: "same-origin" });
  const data = await readInboxResponse<{
    messages?: AppNotification[];
  }>(response, "Không thể tải thông báo.");
  return data.messages ?? [];
}