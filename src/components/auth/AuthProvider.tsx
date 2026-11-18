"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase/client";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        try {
          if (currentUser) {
            const idToken = await currentUser.getIdToken();

            const response = await fetch("/api/auth/session", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "same-origin",
              body: JSON.stringify({ idToken }),
            });

            if (!response.ok) {
              throw new Error("Không thể khôi phục phiên đăng nhập");
            }

            if (
              window.location.pathname === "/login" ||
              window.location.pathname === "/register"
            ) {
              const profileResponse = await fetch("/api/auth/me", {
                credentials: "same-origin",
              });
              if (profileResponse.ok) {
                const profile = await profileResponse.json() as {
                  role?: "student" | "teacher" | "admin";
                  onboardingCompleted?: boolean;
                };
                const destination =
                  profile.role === "admin"
                    ? "/dashboard"
                    : profile.role === "teacher"
                      ? "/teacher/dashboard"
                      : profile.onboardingCompleted
                        ? "/student-dashboard"
                        : "/onboarding";
                router.replace(destination);
              }
            }
          }

          setUser(currentUser);
        } catch (error) {
          console.error("Auth state error:", error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}