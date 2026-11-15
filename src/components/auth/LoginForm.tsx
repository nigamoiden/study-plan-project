"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { loginUser } from "@/features/auth/services/auth.service";

import GoogleLoginButton from "./GoogleLoginButton";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      await loginUser({ email, password });

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      const messages: Record<string, string> = {
        "auth/invalid-credential":
          "Email hoặc mật khẩu không chính xác",

        "auth/too-many-requests":
          "Bạn đã thử đăng nhập quá nhiều lần",

        "auth/user-disabled":
          "Tài khoản đã bị vô hiệu hóa",
      };

      setError(
        messages[err.code] || "Đăng nhập thất bại"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Đăng nhập
        </h1>

        <p className="mt-2 text-gray-500">
          Tiếp tục hành trình học tập của bạn.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full rounded-lg border p-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="w-full rounded-lg border p-3"
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="w-full rounded-lg bg-violet-700 p-3 text-white hover:bg-violet-800 disabled:opacity-50"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <div className="text-center text-sm text-gray-500">
        Hoặc
      </div>

      <GoogleLoginButton />

      <p className="text-center text-sm">
        Chưa có tài khoản?{" "}
        <a href="/register" className="text-violet-700">
          Đăng ký ngay
        </a>
      </p>
    </div>
  );
}