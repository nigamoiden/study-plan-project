import type { AppNotification } from "../types/notification.types";

export async function listNotifications(): Promise<AppNotification[]> {
  const response = await fetch("/api/inbox", { credentials: "same-origin" });
  const data = await response.json() as { messages?: AppNotification[]; error?: string };
  if (!response.ok) throw new Error(data.error ?? "Không thể tải thông báo.");
  return data.messages ?? [];
}