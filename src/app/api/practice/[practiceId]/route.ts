import { NextResponse } from "next/server";

import { getPublicPracticeItemById } from "@/server/practice/catalog";
import { requireUser } from "@/server/auth/require-user";

type Context = {
  params: Promise<{ practiceId: string }>;
};

export async function GET(_: Request, context: Context) {
  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
  }

  const { practiceId } = await context.params;
  const practice = getPublicPracticeItemById(practiceId);

  if (!practice) {
    return NextResponse.json(
      { error: "Không tìm thấy bài luyện tập." },
      { status: 404 }
    );
  }

  return NextResponse.json({ practice });
}
