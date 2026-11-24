
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signOut,
  updateProfile,
  browserLocalPersistence,
  browserSessionPersistence,
  type User,
} from "firebase/auth";

import { auth, googleProvider } from "@/lib/firebase/client";

import type {
  LoginInput,
  RegisterInput,
  PasswordResetInput,
} from "../types/auth.types";

export type SessionProfile = {
  role: "student" | "teacher" | "admin";
  onboardingCompleted: boolean;
};

const sessionPromises = new Map<string, Promise<SessionProfile>>();
const REMEMBER_ME_KEY = "study-plan-remember-me";

function getRememberMePreference(): boolean {
  return typeof window === "undefined" ||
    window.localStorage.getItem(REMEMBER_ME_KEY) !== "false";
}

function saveRememberMePreference(rememberMe: boolean): void {
  window.localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));
}

export async function createSession(
  user: User,
  rememberMe = getRememberMePreference()
): Promise<SessionProfile> {
  const existing = sessionPromises.get(user.uid);
  if (existing) {
    return existing;
  }

  const promise = (async () => {
    const idToken = await user.getIdToken();
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({ idToken, rememberMe }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null) as
        | { error?: string }
        | null;
      throw new Error(data?.error ?? "Không thể tạo phiên đăng nhập");
    }

    const data = await response.json() as {
      role?: "student" | "teacher" | "admin";
      onboardingCompleted?: boolean;
    };

    return {
      role: data.role ?? "student",
      onboardingCompleted: Boolean(data.onboardingCompleted),
    };
  })();

  sessionPromises.set(user.uid, promise);
  try {
    return await promise;
  } finally {
    sessionPromises.delete(user.uid);
  }
}

export async function registerUser(
  input: RegisterInput
): Promise<User> {
  saveRememberMePreference(true);
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
  input: LoginInput,
  rememberMe = true
): Promise<{ user: User; profile: SessionProfile }> {
  saveRememberMePreference(rememberMe);
  await setPersistence(
    auth,
    rememberMe ? browserLocalPersistence : browserSessionPersistence
  );
  const credential = await signInWithEmailAndPassword(
    auth,
    input.email.trim(),
    input.password
  );

  const profile = await createSession(credential.user, rememberMe);

  return { user: credential.user, profile };
}

export async function loginWithGoogle(): Promise<{ user: User; profile: SessionProfile }> {
  saveRememberMePreference(true);
  await setPersistence(auth, browserLocalPersistence);
  const credential = await signInWithPopup(auth, googleProvider);
  const profile = await createSession(credential.user);
  return { user: credential.user, profile };
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
