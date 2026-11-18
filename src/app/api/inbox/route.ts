import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/require-user";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
  }

  const snapshot = await adminDb
    .collection("users")
    .doc(user.uid)
    .collection("inbox")
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();

  const messages = snapshot.docs.map((document) => {
    const data = document.data();
    return {
      id: document.id,
      ...data,
      createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
    };
  });

  return NextResponse.json({ messages });
}
