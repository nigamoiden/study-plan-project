"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { loginWithGoogle } from "@/features/auth/services/auth.service";

export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    try {
      setLoading(true);

      await loginWithGoogle();

      router.push("/student-dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Đăng nhập Google thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={loading}
      className="w-full rounded-lg border p-3 hover:bg-gray-50 disabled:opacity-50"
    >
      {loading ? "Đang xử lý..." : "Tiếp tục với Google"}
    </button>
  );
}