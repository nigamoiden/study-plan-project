import { NextRequest, NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/require-user";
import { checkRateLimit } from "@/server/security/rate-limit";
import {
  inboxMessagePatchSchema,
  isSameOrigin,
} from "@/server/inbox/validation";

function rateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Bạn thao tác quá nhanh. Vui lòng thử lại sau." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    }
  );
}

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
  }

  const limit = checkRateLimit(`inbox-read:${user.uid}`, 120, 10 * 60 * 1000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  try {
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
        type: data.type,
        title: data.title,
        message: data.message,
        ...(typeof data.score === "number" ? { score: data.score } : {}),
        status: data.status,
        createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
        read: data.read === true,
      };
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Load inbox error:", error);
    return NextResponse.json(
      { error: "Không thể tải hộp thư." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!isSameOrigin(request.headers.get("origin"), request.nextUrl.origin)) {
    return NextResponse.json({ error: "Origin không hợp lệ." }, { status: 403 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
  }

  const limit = checkRateLimit(`inbox-update:${user.uid}`, 30, 10 * 60 * 1000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSeconds);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Thông báo không hợp lệ." }, { status: 400 });
  }

  const parsed = inboxMessagePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Thông báo không hợp lệ." }, { status: 400 });
  }

  const messageRef = adminDb
    .collection("users")
    .doc(user.uid)
    .collection("inbox")
    .doc(parsed.data.messageId);

  try {
    const updated = await adminDb.runTransaction(async (transaction) => {
      const message = await transaction.get(messageRef);
      if (!message.exists) return false;

      transaction.update(messageRef, { read: parsed.data.read ?? true });
      return true;
    });

    if (!updated) {
      return NextResponse.json({ error: "Không tìm thấy thông báo." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update inbox message error:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật thông báo." },
      { status: 500 }
    );
  }
}
