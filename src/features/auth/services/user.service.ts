
import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import type { UserProfile } from "../types/auth.types";

const USERS_COLLECTION = "users";

export async function getUserProfile(
  uid: string
): Promise<UserProfile | null> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    uid: snapshot.id,
    ...snapshot.data(),
  } as UserProfile;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, "displayName" | "photoURL">>
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, uid);

  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
