
import type { User } from "firebase/auth";

export type AuthUser = User;

export type UserRole = "student" | "teacher" | "admin" | "super_admin";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  onboardingCompleted: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface PasswordResetInput {
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
}
