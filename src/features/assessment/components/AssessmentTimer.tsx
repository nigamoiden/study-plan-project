
"use client";

import { useEffect, useState } from "react";

interface Props {
  endsAt: string;
  onTimeUp: () => void;
}

function getRemainingSeconds(endsAt: string) {
  return Math.max(
    0,
    Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000)
  );
}

export default function AssessmentTimer({
  endsAt,
  onTimeUp,
}: Props) {
  const [remaining, setRemaining] = useState(() =>
    getRemainingSeconds(endsAt)
  );

  useEffect(() => {
    const update = () => {
      setRemaining(getRemainingSeconds(endsAt));
    };

    update();

    const interval = window.setInterval(update, 1000);

    return () => window.clearInterval(interval);
  }, [endsAt]);

  useEffect(() => {
    if (remaining === 0) {
      onTimeUp();
    }
  }, [remaining, onTimeUp]);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const formatted = [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");

  const isWarning = remaining <= 5 * 60;

  return (
    <div
      className={`rounded-xl px-4 py-3 text-center font-mono text-xl font-bold ${
        isWarning
          ? "bg-red-50 text-red-600"
          : "bg-purple-50 text-purple-700"
      }`}
      aria-live="polite"
    >
      <div className="mb-1 font-sans text-xs font-medium">
        Thời gian còn lại
      </div>
      {formatted}
    </div>
  );
}
