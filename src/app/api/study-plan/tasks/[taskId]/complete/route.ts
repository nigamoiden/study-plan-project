import { NextResponse } from "next/server";

import { setStudyTaskCompletion } from "@/server/learning/study-plan";
import { requireUser } from "@/server/auth/require-user";

type Context = {
  params: Promise<{ taskId: string }>;
};

async function updateCompletion(
  request: Request,
  context: Context,
  completed: boolean
) {
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
    const plan = await setStudyTaskCompletion(user.uid, taskId, completed);

    if (!plan) {
      return NextResponse.json(
        { error: "Không tìm thấy nhiệm vụ trong lộ trình." },
        { status: 404 }
      );
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Update study task completion error:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật tiến độ học." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: Context) {
  return updateCompletion(request, context, true);
}

export async function DELETE(request: Request, context: Context) {
  return updateCompletion(request, context, false);
}
