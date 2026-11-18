import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/require-user";
import { requireTeacherOrAdmin } from "@/server/assessment/permissions";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
  }

  await requireTeacherOrAdmin(user.uid);
  const profile = await adminDb.collection("users").doc(user.uid).get();
  const role = profile.data()?.role ?? "student";

  let query: FirebaseFirestore.Query = adminDb.collection("lessonGradingReviews");
  if (role !== "admin") {
    query = query.where("teacherId", "==", user.uid);
  }

  const snapshot = await query.orderBy("createdAt", "desc").limit(100).get();
  const reviews = snapshot.docs.map((document) => {
    const data = document.data();
    return {
      id: document.id,
      ...data,
      submittedAt: data.submittedAt?.toISOString?.() ?? null,
      createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
    };
  });

  return NextResponse.json({ reviews });
}
