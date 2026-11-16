import { NextResponse } from "next/server";

import { completeStudyTask } from "@/server/learning/study-plan";
import { requireUser } from "@/server/auth/require-user";

type Context = {
  params: Promise<{ taskId: string }>;
};

export async function POST(request: Request, context: Context) {
  const origin = request.headers.get("origin");

  if (!origin || origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 403 });
  }

  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
  }

  const { taskId } = await context.params;

  if (!taskId || taskId.length > 100) {
    return NextResponse.json({ error: "Mã nhiệm vụ không hợp lệ." }, { status: 400 });
  }

  try {
    const plan = await completeStudyTask(user.uid, taskId);

    if (!plan) {
      return NextResponse.json(
        { error: "Không tìm thấy nhiệm vụ trong lộ trình." },
        { status: 404 }
      );
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Complete study task error:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật tiến độ học." },
      { status: 500 }
    );
  }
}
