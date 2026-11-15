
"use client";

import { useState } from "react";
import Link from "next/link";

import { passwordResetSchema } from "../schemas/auth.schema";
import { resetPassword } from "../services/auth.service";

export default function PasswordResetForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    const validation = passwordResetSchema.safeParse({ email });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Email không hợp lệ");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(validation.data);
      setSuccess(true);
    } catch {
      setError(
        "Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Đặt lại mật khẩu
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Nhập email đã đăng ký. Nếu tài khoản tồn tại, bạn sẽ
          nhận được hướng dẫn đặt lại mật khẩu.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Địa chỉ email
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

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            Nếu email này được đăng ký, hướng dẫn đặt lại mật khẩu
            sẽ được gửi đến hộp thư của bạn. Hãy kiểm tra cả thư rác.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? "Đang gửi..." : "Gửi email đặt lại mật khẩu"}
        </button>
      </form>

      <Link
        href="/login"
        className="mt-6 block text-center text-sm font-semibold text-violet-600 hover:underline"
      >
        Quay lại đăng nhập
      </Link>
    </div>
  );
}
