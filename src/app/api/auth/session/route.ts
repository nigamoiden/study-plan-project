import { NextRequest, NextResponse } from "next/server";

import {
  adminAuth,
  adminDb,
} from "@/lib/firebase/admin";

import { FieldValue } from "firebase-admin/firestore";
import { checkRateLimit } from "@/server/security/rate-limit";
import {
  getSessionCookieOptions,
  SESSION_EXPIRES_IN_MS,
} from "@/server/auth/session-cookie";
import { createSessionSchema } from "@/server/auth/session-schema";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const limit = checkRateLimit(`session:${ip}`, 30, 10 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Quá nhiều lần đăng nhập. Vui lòng thử lại sau." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }
    const origin = request.headers.get("origin");

    const expectedOrigin = new URL(request.url).origin;

    if (!origin || origin !== expectedOrigin) {
      return NextResponse.json(
        { error: "Invalid origin" },
        { status: 403 }
      );
    }

    const parsedBody = createSessionSchema.safeParse(
      await request.json().catch(() => null)
    );

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Yêu cầu tạo phiên không hợp lệ." },
        { status: 400 }
      );
    }
    const { idToken, rememberMe } = parsedBody.data;

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken, true);
    } catch (error) {
      console.warn("ID token verification failed:", error);
      return NextResponse.json(
        { error: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn." },
        { status: 401 }
      );
    }
    const signInProvider =
      typeof decodedToken.firebase === "object" &&
      decodedToken.firebase !== null &&
      "sign_in_provider" in decodedToken.firebase
        ? decodedToken.firebase.sign_in_provider
        : null;
    const isGoogleSignIn = signInProvider === "google.com";

    if (!isGoogleSignIn && decodedToken.email_verified !== true) {
      return NextResponse.json(
        { error: "Hãy xác minh email trước khi đăng nhập." },
        { status: 403 }
      );
    }

    const firebaseProfile = await adminDb
      .collection("users")
      .doc(decodedToken.uid)
      .get();
    const firebaseProfileData = firebaseProfile.data();
    if (firebaseProfileData?.disabled === true) {
      return NextResponse.json(
        { error: "Tài khoản của bạn đã bị khóa." },
        { status: 403 }
      );
    }

    const sessionCookie = await adminAuth.createSessionCookie(
      idToken,
      { expiresIn: SESSION_EXPIRES_IN_MS }
    );

    const userRef = adminDb
      .collection("users")
      .doc(decodedToken.uid);

    await adminDb.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(userRef);

      if (!snapshot.exists) {
        transaction.create(userRef, {
          uid: decodedToken.uid,
          email: decodedToken.email ?? null,
          displayName: decodedToken.name ?? null,
          photoURL: decodedToken.picture ?? null,

          role: "student",

          onboardingCompleted: false,

          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    });

    const response = NextResponse.json({
      success: true,
      role: firebaseProfileData?.role ?? "student",
      onboardingCompleted: Boolean(firebaseProfileData?.onboardingCompleted),
    });

    response.cookies.set(
      "__session",
      sessionCookie,
      getSessionCookieOptions(rememberMe, process.env.NODE_ENV === "production")
    );

    return response;
  } catch (error) {
    console.error("Session error:", error);

    return NextResponse.json(
      {
        error:
          "Không thể tạo phiên đăng nhập. Hãy kiểm tra cấu hình Firebase Admin trên máy chủ.",
      },
      { status: 503 }
    );
  }
}
