import { NextRequest, NextResponse } from "next/server";

import {
  adminAuth,
  adminDb,
} from "@/lib/firebase/admin";

import { FieldValue } from "firebase-admin/firestore";

const EXPIRES_IN = 5 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    // Kiểm tra origin
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

    // Xác thực ID Token
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const sessionCookie = await adminAuth.createSessionCookie(
      idToken,
      { expiresIn: EXPIRES_IN }
    );

    // Tạo hồ sơ nếu người dùng chưa có
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