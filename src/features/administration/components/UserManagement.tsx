import { getUserManagementData } from "../services/admin.service";

export default function UserManagement() {
  const users = getUserManagementData();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-violet-600">Quản lý người dùng</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Người dùng hệ thống</h2>
        </div>
        <button className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
          + Thêm người dùng
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="pb-3 pr-4 font-medium">Tên</th>
              <th className="pb-3 pr-4 font-medium">Vai trò</th>
              <th className="pb-3 pr-4 font-medium">Khoa</th>
              <th className="pb-3 pr-4 font-medium">Trạng thái</th>
              <th className="pb-3 font-medium">Đăng nhập cuối</th>
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
                        : user.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="py-3 text-slate-600">{user.lastLogin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
