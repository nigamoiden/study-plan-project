import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export { adminDb };

export interface AuthenticatedUser {
  uid: string;
  email: string | null;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export async function requireAssessmentUser(
  request: NextRequest
): Promise<AuthenticatedUser> {
  if (MUTATING_METHODS.has(request.method)) {
    const origin = request.headers.get("origin");

    if (!origin || origin !== request.nextUrl.origin) {
      throw new HttpError(403, "Origin không hợp lệ.");
    }
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) {
    throw new HttpError(401, "Bạn cần đăng nhập.");
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(
      sessionCookie,
      true
    );

    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
    };
  } catch {
    throw new HttpError(401, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }

  console.error("[Assessment API]", error);

  return NextResponse.json(
    { error: "Đã xảy ra lỗi máy chủ." },
    { status: 500 }
  );
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function toISOString(value: unknown): string | null {
  if (!value) return null;

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  return null;
}

export function serializeAttempt(
  id: string,
  data: FirebaseFirestore.DocumentData
) {
  return {
    id,
    assessmentId: data.assessmentId,
    userId: data.userId,
    status: data.status,
    answers: data.answers ?? [],
    startedAt: toISOString(data.startedAt),
    endsAt: toISOString(data.endsAt),
    submittedAt: toISOString(data.submittedAt),
    createdAt: toISOString(data.createdAt),
    updatedAt: toISOString(data.updatedAt),
  };
}