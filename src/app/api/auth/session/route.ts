import { NextRequest, NextResponse } from "next/server";

import {
  adminAuth,
  adminDb,
} from "@/lib/firebase/admin";

import { FieldValue } from "firebase-admin/firestore";
import { checkRateLimit } from "@/server/security/rate-limit";

const EXPIRES_IN = 5 * 24 * 60 * 60 * 1000;

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

    if (origin && origin !== expectedOrigin) {
      return NextResponse.json(
        { error: "Invalid origin" },
        { status: 403 }
      );
    }

    const { idToken } = await request.json();

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "Missing ID token" },
        { status: 400 }
      );
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
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
    if (firebaseProfile.data()?.disabled === true) {
      return NextResponse.json(
        { error: "Tài khoản của bạn đã bị khóa." },
        { status: 403 }
      );
    }

    const sessionCookie = await adminAuth.createSessionCookie(
      idToken,
      { expiresIn: EXPIRES_IN }
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
    });

    response.cookies.set("__session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: EXPIRES_IN / 1000,
    });

    return response;
  } catch (error) {
    console.error("Session error:", error);

    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}