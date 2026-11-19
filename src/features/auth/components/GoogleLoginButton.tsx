
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithGoogle } from "../services/auth.service";

interface GoogleLoginButtonProps {
  redirectTo?: string;
}

function getGoogleLoginError(error: unknown): string {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : "";

  switch (code) {
    case "auth/popup-closed-by-user":
      return "Bạn đã đóng cửa sổ đăng nhập Google.";
    case "auth/popup-blocked":
      return "Trình duyệt đã chặn cửa sổ đăng nhập.";
    case "auth/unauthorized-domain":
      return "Hãy thêm domain website vào Firebase Authentication > Settings > Authorized domains.";
    case "auth/operation-not-allowed":
      return "Hãy bật Google trong Firebase Authentication > Sign-in method.";
    case "auth/invalid-api-key":
      return "Cấu hình Firebase Web trên Vercel không hợp lệ.";
    case "auth/network-request-failed":
      return "Không thể kết nối Firebase. Hãy kiểm tra kết nối mạng và thử lại.";
  }

  if (
    error instanceof Error &&
    (
      error.message === "Không thể tạo phiên đăng nhập" ||
      error.message.includes("phiên đăng nhập")
    )
  ) {
    return "Đăng nhập Google thành công nhưng máy chủ không tạo được phiên. Hãy kiểm tra POST /api/auth/session trên Vercel.";
  }

  return code
    ? `Đăng nhập Google thất bại (${code}).`
    : "Đăng nhập Google thất bại. Vui lòng thử lại.";
}

export default function GoogleLoginButton({
  redirectTo = "/student-dashboard",
}: GoogleLoginButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");

    try {
      const { profile } = await loginWithGoogle();
      const destination =
        profile.role === "admin"
          ? "/dashboard"
          : profile.role === "teacher"
            ? "/teacher/dashboard"
            : profile.onboardingCompleted
              ? redirectTo
              : "/onboarding";
      router.replace(destination);
      router.refresh();
    } catch (err) {
      setError(getGoogleLoginError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
      >
        <svg
          viewBox="0 0 48 48"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            transform="translate(0 0) scale(1)"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.95 46.98 31.75 46.98 24.55z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.44-4.88 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>

        {loading ? "Đang đăng nhập..." : "Tiếp tục với Google"}
      </button>

      {error && (
        <p className="mt-3 text-center text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
