import { z } from "zod";

export const inboxMessagePatchSchema = z.object({
  messageId: z
    .string()
    .min(1)
    .max(128)
    .refine((value) => !value.includes("/") && value !== "." && value !== ".."),
  read: z.boolean().optional(),
}).strict();

export function isSameOrigin(
  requestOrigin: string | null,
  expectedOrigin: string
): boolean {
  return requestOrigin === expectedOrigin;
}
