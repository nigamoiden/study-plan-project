import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
  signOut,
  User,
} from "firebase/auth";

import {
  auth,
  googleProvider,
} from "@/lib/firebase/client";

// Tạo session cookie ở backend
async function createSession(user: User) {
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
    throw new Error("Không thể tạo phiên đăng nhập");
  }
}

// Đăng ký
export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await updateProfile(credential.user, {
    displayName: name,
  });

  await sendEmailVerification(credential.user);

  await createSession(credential.user);

  return credential.user;
}

// Đăng nhập email
export async function loginUser(
  email: string,
  password: string
) {
  const credential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  await createSession(credential.user);

  return credential.user;
}

// Đăng nhập Google
export async function loginWithGoogle() {
  const credential = await signInWithPopup(
    auth,
    googleProvider
  );

  await createSession(credential.user);

  return credential.user;
}

// Đăng xuất
export async function logoutUser() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error("Không thể kết thúc phiên đăng nhập");
  }

  await signOut(auth);
}