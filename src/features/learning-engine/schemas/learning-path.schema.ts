import { z } from "zod";

export const learningTaskSchema = z.object({
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  kind: z.enum(["learn", "practice"]),
  title: z.string().trim().min(1).max(200),
  completed: z.boolean(),
  lessonId: z.string().optional(),
});