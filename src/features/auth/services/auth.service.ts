
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";

import { auth, googleProvider } from "@/lib/firebase/client";

import type {
  LoginInput,
  RegisterInput,
  PasswordResetInput,
} from "../types/auth.types";

async function createSession(user: User): Promise<void> {
  const idToken = await user.getIdToken();

  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null) as
      | { error?: string }
      | null;
    throw new Error(data?.error ?? "Không thể tạo phiên đăng nhập");
  }
}

export async function registerUser(
  input: RegisterInput
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(
    auth,
    input.email.trim(),
    input.password
  );

  await updateProfile(credential.user, {
    displayName: input.name.trim(),
  });

  await sendEmailVerification(credential.user);

  await createSession(credential.user);

  return credential.user;
}

export async function loginUser(
  input: LoginInput
): Promise<User> {
  const credential = await signInWithEmailAndPassword(
    auth,
    input.email.trim(),
    input.password
  );

  await createSession(credential.user);

  return credential.user;
}

export async function loginWithGoogle(): Promise<User> {
  await signInWithRedirect(auth, googleProvider);
  return new Promise<User>(() => undefined);
}

export async function completeGoogleRedirectLogin(): Promise<User | null> {
  await auth.authStateReady();
  const credential = await getRedirectResult(auth);
  if (!credential) return null;
  await createSession(credential.user);
  return credential.user;
}

export async function resetPassword(
  input: PasswordResetInput
): Promise<void> {
  await sendPasswordResetEmail(auth, input.email.trim());
}

export async function logoutUser(): Promise<void> {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });

    if (!response.ok) {
      throw new Error("Không thể kết thúc phiên đăng nhập");
    }
  } finally {
    await signOut(auth);
  }
}
