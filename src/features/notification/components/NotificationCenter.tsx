"use client";

import { useEffect, useState } from "react";

import type { AppNotification } from "../types/notification.types";
import { listNotifications } from "../services/notification.service";
import NotificationItem from "./NotificationItem";

export default function NotificationCenter() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listNotifications()
      .then((result) => { if (active) setItems(result); })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : "Không thể tải thông báo.");
      });
    return () => { active = false; };
  }, []);

  return (
    <section className="space-y-3">
      {error && <p className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
      {items.map((item) => <NotificationItem key={item.id} item={item} />)}
      {!error && items.length === 0 && <p className="text-sm text-slate-500">Chưa có thông báo.</p>}
    </section>
  );
}