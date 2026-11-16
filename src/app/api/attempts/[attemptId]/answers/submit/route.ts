import { NextRequest, NextResponse } from "next/server";

type Context = {
  params: Promise<{ attemptId: string }>;
};

export async function POST(
  _request: NextRequest,
  context: Context
) {
  const { attemptId } = await context.params;

  return NextResponse.json({
    success: true,
    attemptId,
    message: "Submission endpoint is handled by the main answers route.",
  });
}
