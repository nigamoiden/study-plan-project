import { NextResponse } from "next/server";

import { getDiagnosticQuestions } from "@/server/onboarding/diagnostic";
import { requireUser } from "@/server/auth/require-user";

export async function GET() {
  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
  }

  return NextResponse.json({ questions: getDiagnosticQuestions() });
}
