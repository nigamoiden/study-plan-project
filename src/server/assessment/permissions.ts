import { HttpError, adminDb } from "./http";

export async function getUserRole(uid: string): Promise<string> {
  const userSnap = await adminDb.collection("users").doc(uid).get();

  if (!userSnap.exists) {
    throw new HttpError(403, "Không tìm thấy hồ sơ người dùng.");
  }

  return userSnap.data()?.role ?? "student";
}

export function isAdminRole(role: unknown): role is "admin" | "super_admin" {
  return role === "admin" || role === "super_admin";
}

export async function requireTeacherOrAdmin(uid: string) {
  const role = await getUserRole(uid);

  if (role !== "teacher" && !isAdminRole(role)) {
    throw new HttpError(403, "Bạn không có quyền thực hiện thao tác này.");
  }

  return role;
}

export async function requireAdmin(uid: string) {
  const role = await getUserRole(uid);

  if (!isAdminRole(role)) {
    throw new HttpError(403, "Chỉ quản trị viên mới được thực hiện thao tác này.");
  }
}

export async function requireAttemptOwner(
  attemptId: string,
  uid: string
) {
  const ref = adminDb.collection("assessmentAttempts").doc(attemptId);
  const snap = await ref.get();

  if (!snap.exists) {
    throw new HttpError(404, "Không tìm thấy lượt thi.");
  }

  const attempt = snap.data()!;

  if (attempt.userId !== uid) {
    throw new HttpError(403, "Bạn không có quyền truy cập lượt thi này.");
  }

  return { ref, data: attempt };
}
