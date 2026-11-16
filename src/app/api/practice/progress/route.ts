import { NextResponse } from "next/server";

import { requireUser } from "@/server/auth/require-user";
import { getPracticeProgress } from "@/server/practice/progress";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
  }

  try {
    return NextResponse.json({ progress: await getPracticeProgress(user.uid) });
  } catch (error) {
    console.error("Load practice progress error:", error);
    return NextResponse.json(
      { error: "Không thể tải tiến độ luyện tập." },
      { status: 500 }
    );
  }
}
