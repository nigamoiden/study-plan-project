import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/require-user";
import { isAdminRole, requireTeacherOrAdmin } from "@/server/assessment/permissions";
import { handleApiError } from "@/server/assessment/http";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
    }

    await requireTeacherOrAdmin(user.uid);
    const profile = await adminDb.collection("users").doc(user.uid).get();
    const role = profile.data()?.role ?? "student";

    let query: FirebaseFirestore.Query = adminDb.collection("lessonGradingReviews");
    if (!isAdminRole(role)) {
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
  } catch (error) {
    return handleApiError(error);
  }
}
