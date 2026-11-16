import "server-only";

import { adminDb } from "@/lib/firebase/admin";
import type { PracticeSummary } from "@/features/practice/types/practice.types";

function vietnameseDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function previousDateKey(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export async function getPracticeProgress(
  uid: string
): Promise<PracticeSummary> {
  const attempts = adminDb
    .collection("users")
    .doc(uid)
    .collection("practiceAttempts");
  const [snapshot, countSnapshot] = await Promise.all([
    attempts.orderBy("submittedAt", "desc").limit(200).get(),
    attempts.count().get(),
  ]);
  const scores = snapshot.docs.map((document) => {
    const score = document.get("score");
    return typeof score === "number" ? score : 0;
  });
  const activeDates = new Set(
    snapshot.docs
      .map((document) => document.get("submittedAt")?.toDate?.())
      .filter((date): date is Date => date instanceof Date)
      .map(vietnameseDateKey)
  );

  let streak = 0;
  let dateToCheck = vietnameseDateKey(new Date());

  if (!activeDates.has(dateToCheck)) {
    dateToCheck = previousDateKey(dateToCheck);
  }

  while (activeDates.has(dateToCheck)) {
    streak += 1;
    dateToCheck = previousDateKey(dateToCheck);
  }

  return {
    attempts: countSnapshot.data().count,
    averageScore: scores.length
      ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
      : 0,
    streak,
  };
}
