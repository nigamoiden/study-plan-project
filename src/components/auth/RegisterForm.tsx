"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { registerUser } from "@/features/auth/services/auth.service";

import GoogleLoginButton from "./GoogleLoginButton";

export default function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);

      await registerUser({ name, email, password, confirmPassword });

      router.push("/onboarding");
      router.refresh();
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      const messages: Record<string, string> = {
        "auth/email-already-in-use":
          "Email đã được sử dụng",

        "auth/invalid-email":
          "Email không hợp lệ",

        "auth/weak-password":
          "Mật khẩu chưa đủ mạnh",

        "auth/operation-not-allowed":
          "Phương thức đăng ký chưa được bật",
      };

      setError(
        messages[firebaseError.code ?? ""] || "Không thể tạo tài khoản"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Tạo tài khoản
        </h1>

        <p className="mt-2 text-gray-500">
          Bắt đầu xây dựng lộ trình học tập của bạn.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full rounded-lg border p-3"
          placeholder="Họ và tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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
          placeholder="Mật khẩu (tối thiểu 8 ký tự)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />

        <input
          className="w-full rounded-lg border p-3"
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
        </button>
      </form>

      <div className="text-center text-sm text-gray-500">
        Hoặc
      </div>

      <GoogleLoginButton />

      <p className="text-center text-sm">
        Đã có tài khoản?{" "}
        <a href="/login" className="text-violet-700">
          Đăng nhập
        </a>
      </p>
    </div>
  );
}