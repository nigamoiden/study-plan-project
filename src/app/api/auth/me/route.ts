import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/require-user";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
  }

  const profile = await adminDb.collection("users").doc(user.uid).get();
  const data = profile.data();

  return NextResponse.json({
    role: data?.role ?? "student",
    onboardingCompleted: Boolean(data?.onboardingCompleted),
  });
}
