import { z } from "zod";

export const createSessionSchema = z.object({
  idToken: z.string().min(1).max(10_000),
  rememberMe: z.boolean().default(true),
}).strict();
