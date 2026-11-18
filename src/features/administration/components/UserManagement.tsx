"use client";

import { useEffect, useState } from "react";

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  status: "active" | "suspended";
  department: string;
};

export default function UserManagement() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/users", { credentials: "same-origin" });
      const data = await response.json() as { users?: ManagedUser[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Không thể tải người dùng.");
      setUsers(data.users ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải người dùng.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/users", { credentials: "same-origin" })
      .then(async (response) => {
        const data = await response.json() as { users?: ManagedUser[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Không thể tải người dùng.");
        if (active) setUsers(data.users ?? []);
      })
      .catch((cause) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Không thể tải người dùng.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  async function updateUser(uid: string, payload: { role?: ManagedUser["role"]; disabled?: boolean }) {
    setSaving(uid);
    setError("");
    try {
      const response = await fetch(`/api/admin/users?uid=${encodeURIComponent(uid)}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Không thể cập nhật người dùng.");
      await loadUsers();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể cập nhật người dùng.");
    } finally {
      setSaving("");
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-violet-600">Quản lý người dùng</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Người dùng hệ thống</h2>
        </div>
        <button
          type="button"
          onClick={() => void loadUsers()}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Làm mới
        </button>
      </div>

      {loading && <p className="mb-4 text-sm text-slate-500">Đang tải người dùng...</p>}
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="pb-3 pr-4 font-medium">Tên</th>
              <th className="pb-3 pr-4 font-medium">Vai trò</th>
              <th className="pb-3 pr-4 font-medium">Khoa</th>
              <th className="pb-3 pr-4 font-medium">Trạng thái</th>
              <th className="pb-3 font-medium">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 last:border-0">
                <td className="py-3 pr-4">
                  <div>
                    <p className="font-semibold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {user.role}
                  </span>
                </td>
                <td className="py-3 pr-4 text-slate-600">{user.department}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      user.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex min-w-52 gap-2">
                    <select
                      aria-label={`Vai trò của ${user.name || user.email}`}
                      value={user.role}
                      disabled={saving === user.id}
                      onChange={(event) =>
                        void updateUser(user.id, {
                          role: event.target.value as ManagedUser["role"],
                        })
                      }
                      className="rounded-lg border border-slate-300 px-2 py-1.5"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      type="button"
                      disabled={saving === user.id}
                      onClick={() =>
                        void updateUser(user.id, {
                          disabled: user.status !== "suspended",
                        })
                      }
                      className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-semibold"
                    >
                      {user.status === "suspended" ? "Mở khóa" : "Khóa"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
