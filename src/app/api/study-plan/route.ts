import { NextResponse } from "next/server";

import { requireUser } from "@/server/auth/require-user";
import {
  ensureStudyPlan,
  OnboardingRequiredError,
} from "@/server/learning/study-plan";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
  }

  try {
    return NextResponse.json({ plan: await ensureStudyPlan(user.uid) });
  } catch (error) {
    if (error instanceof OnboardingRequiredError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error("Load study plan error:", error);
    return NextResponse.json(
      { error: "Không thể tải lộ trình học." },
      { status: 500 }
    );
  }
}
