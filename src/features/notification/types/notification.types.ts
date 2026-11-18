export type NotificationType =
  | "lesson_result"
  | "graded_review"
  | "reminder";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  score?: number;
  status: "delivered" | "pending_review" | "read";
  createdAt: string | null;
  read: boolean;
}