
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { loginSchema } from "../schemas/auth.schema";
import { loginUser } from "../services/auth.service";
import GoogleLoginButton from "./GoogleLoginButton";

function getLoginError(code: string) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Email hoặc mật khẩu không chính xác.";

    case "auth/too-many-requests":
      return "Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.";

    case "auth/user-disabled":
      return "Tài khoản này đã bị vô hiệu hóa.";

    case "auth/network-request-failed":
      return "Không thể kết nối mạng. Vui lòng thử lại.";

    default:
      return "Đăng nhập thất bại. Vui lòng thử lại.";
  }
}

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    const validation = loginSchema.safeParse({
      email,
      password,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Dữ liệu không hợp lệ");
      return;
    }

    setLoading(true);

    try {
      await loginUser(validation.data);
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      const code =
        err instanceof Error ? err.message : "";

      setError(getLoginError(code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          Chào mừng trở lại
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Đăng nhập để tiếp tục hành trình học tập.
        </p>
      </div>

      <GoogleLoginButton redirectTo="/dashboard" />

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">
          HOẶC ĐĂNG NHẬP BẰNG EMAIL
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="example@email.com"
            autoComplete="email"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-600"
          />
        </div>

        <div>
          <div className="mb-2 flex justify-between">
            <label className="text-sm font-semibold">
              Mật khẩu
            </label>
            <Link
              href="/reset-password"
              className="text-sm font-medium text-violet-600 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nhập mật khẩu"
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-600"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        Chưa có tài khoản?{" "}
        <Link
          href="/register"
          className="font-semibold text-violet-600 hover:underline"
        >
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
