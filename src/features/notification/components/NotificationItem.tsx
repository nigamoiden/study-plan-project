import type { AppNotification } from "../types/notification.types";

export default function NotificationItem({ item }: { item: AppNotification }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex justify-between gap-3">
        <h2 className="font-semibold text-slate-900">{item.title}</h2>
        {typeof item.score === "number" && (
          <span className="font-bold text-violet-700">{item.score}%</span>
        )}
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{item.message}</p>
    </article>
  );
}