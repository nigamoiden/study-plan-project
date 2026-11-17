
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { registerSchema } from "../schemas/auth.schema";
import { registerUser } from "../services/auth.service";
import GoogleLoginButton from "./GoogleLoginButton";

function getRegisterError(code: string) {
  switch (code) {
    case "auth/email-already-in-use":
      return "Email này đã được sử dụng.";

    case "auth/weak-password":
      return "Mật khẩu chưa đủ mạnh.";

    case "auth/invalid-email":
      return "Địa chỉ email không hợp lệ.";

    case "auth/operation-not-allowed":
      return "Phương thức đăng ký hiện chưa được bật.";

    case "auth/network-request-failed":
      return "Không thể kết nối mạng.";

    case "auth/invalid-api-key":
      return "Cấu hình Firebase trên website không hợp lệ. Hãy kiểm tra Firebase Web App config trên Vercel.";

    case "auth/unauthorized-domain":
      return "Tên miền website chưa được cho phép trong Firebase Authentication.";

    default:
      return "Đăng ký thất bại. Vui lòng thử lại.";
  }
}

export default function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    const validation = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Dữ liệu không hợp lệ");
      return;
    }

    setLoading(true);

    try {
      await registerUser(validation.data);

      router.replace("/onboarding");
      router.refresh();
    } catch (err) {
      const code =
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        typeof err.code === "string"
          ? err.code
          : "";

      setError(getRegisterError(code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          Tạo tài khoản
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Bắt đầu xây dựng lộ trình học tập của riêng bạn.
        </p>
      </div>

      <GoogleLoginButton redirectTo="/onboarding" />

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">
          HOẶC ĐĂNG KÝ BẰNG EMAIL
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Họ và tên
          </label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nguyễn Văn A"
            autoComplete="name"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-600"
          />
        </div>

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
          <label className="mb-2 block text-sm font-semibold">
            Mật khẩu
          </label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Ít nhất 8 ký tự"
            autoComplete="new-password"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Xác nhận mật khẩu
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
            placeholder="Nhập lại mật khẩu"
            autoComplete="new-password"
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
          {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="font-semibold text-violet-600 hover:underline"
        >
          Đăng nhập
        </Link>
      </p>

      <p className="mt-4 text-center text-xs leading-5 text-slate-400">
        Khi đăng ký, bạn sẽ nhận được email xác minh tài khoản.
      </p>
    </div>
  );
}
