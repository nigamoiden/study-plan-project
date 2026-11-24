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
import {
  createSession,
  type SessionProfile,
} from "@/features/auth/services/auth.service";

type AuthContextType = {
  user: User | null;
  profile: SessionProfile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SessionProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        try {
          if (currentUser) {
            const currentProfile = await createSession(currentUser);
            setProfile(currentProfile);

            if (
              window.location.pathname === "/" ||
              window.location.pathname === "/login" ||
              window.location.pathname === "/register"
            ) {
              const destination =
              currentProfile.role === "admin" || currentProfile.role === "super_admin"
                  ? "/dashboard"
                  : currentProfile.role === "teacher"
                    ? "/teacher/dashboard"
                    : currentProfile.onboardingCompleted
                      ? "/student-dashboard"
                      : "/onboarding";
              router.replace(destination);
            }
          } else {
            setProfile(null);
          }

          setUser(currentUser);
        } catch (error) {
          console.error("Auth state error:", error);
          setUser(null);
          setProfile(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
