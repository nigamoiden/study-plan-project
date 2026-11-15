
import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Họ tên phải có ít nhất 2 ký tự")
      .max(80, "Họ tên không được vượt quá 80 ký tự"),

    email: z
      .string()
      .trim()
      .email("Email không hợp lệ"),

    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .max(128, "Mật khẩu quá dài"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Email không hợp lệ"),

  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu"),
});

export const passwordResetSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Email không hợp lệ"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type PasswordResetFormValues = z.infer<
  typeof passwordResetSchema
>;
