import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { requireUser } from "@/server/auth/require-user";
import {
  getUserRole,
  requireAdmin,
} from "@/server/assessment/permissions";
import { handleApiError } from "@/server/assessment/http";

const updateUserSchema = z.object({
  role: z.enum(["student", "teacher", "admin", "super_admin"]).optional(),
  disabled: z.boolean().optional(),
}).strict().refine(
  (value) => value.role !== undefined || value.disabled !== undefined,
  { message: "Không có thay đổi nào được gửi." }
);

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
    }
    await requireAdmin(user.uid);
    const actorRole = await getUserRole(user.uid);
    const actorIsSuperAdmin = actorRole === "super_admin";

    const snapshot = await adminDb.collection("users").limit(500).get();
    const users = snapshot.docs.map((document) => {
      const data = document.data();
      const targetRole = data.role ?? "student";
      return {
        id: document.id,
        name: data.displayName ?? data.name ?? "",
        email: data.email ?? "",
        role: targetRole,
        canManage: document.id !== user.uid &&
          (actorIsSuperAdmin || targetRole !== "super_admin"),
        canPromoteToSuperAdmin: actorIsSuperAdmin,
        status: data.disabled ? "suspended" : "active",
        department: data.academicGoal?.targetMajor ?? data.department ?? "",
        updatedAt: data.updatedAt?.toDate?.().toISOString() ?? null,
      };
    });

    return NextResponse.json({ users });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Bạn chưa đăng nhập." }, { status: 401 });
    }
    await requireAdmin(user.uid);
    const actorRole = await getUserRole(user.uid);

    const parsed = updateUserSchema.safeParse(
      await request.json().catch(() => null)
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu cập nhật người dùng không hợp lệ." },
        { status: 400 }
      );
    }

    const targetUid = request.nextUrl.searchParams.get("uid");
    if (!targetUid || targetUid.length > 128) {
      return NextResponse.json({ error: "UID người dùng không hợp lệ." }, { status: 400 });
    }
    if (targetUid === user.uid) {
      return NextResponse.json(
        { error: "Không thể tự khóa hoặc hạ quyền tài khoản đang đăng nhập." },
        { status: 409 }
      );
    }

    const profileRef = adminDb.collection("users").doc(targetUid);
    const profile = await profileRef.get();
    if (!profile.exists) {
      return NextResponse.json({ error: "Không tìm thấy người dùng." }, { status: 404 });
    }

    const targetRole = profile.data()?.role ?? "student";
    if (
      targetRole === "super_admin" &&
      parsed.data.role !== undefined &&
      parsed.data.role !== "super_admin"
    ) {
      return NextResponse.json(
        { error: "Không thể hạ quyền super admin; thao tác này sẽ làm mất dấu quyền sở hữu nội dung cũ." },
        { status: 409 }
      );
    }
    if (
      actorRole !== "super_admin" &&
      (targetRole === "super_admin" || parsed.data.role === "super_admin")
    ) {
      return NextResponse.json(
        { error: "Chỉ super admin mới được quản lý hoặc cấp quyền super admin." },
        { status: 403 }
      );
    }

    if (parsed.data.disabled !== undefined) {
      await adminAuth.updateUser(targetUid, { disabled: parsed.data.disabled });
    }

    await profileRef.set(
      {
        ...(parsed.data.role ? { role: parsed.data.role } : {}),
        ...(parsed.data.disabled !== undefined ? { disabled: parsed.data.disabled } : {}),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
