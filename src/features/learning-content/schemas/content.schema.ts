import { z } from "zod";

import {
  isAllowedSimulationUrl,
  SUBJECT_NAMES,
} from "../constants";

const isHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

const coordinate = z.number().finite().min(0).max(1000);
const verticalCoordinate = z.number().finite().min(0).max(600);

const sketchPointSchema = z.object({
  x: coordinate,
  y: verticalCoordinate,
});

const sketchShapeSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("line"),
    x1: coordinate,
    y1: verticalCoordinate,
    x2: coordinate,
    y2: verticalCoordinate,
  }),
  z.object({
    type: z.literal("circle"),
    cx: coordinate,
    cy: verticalCoordinate,
    r: z.number().finite().min(1).max(600),
  }),
  z.object({
    type: z.literal("rectangle"),
    x: coordinate,
    y: verticalCoordinate,
    width: z.number().finite().min(1).max(1000),
    height: z.number().finite().min(1).max(600),
  }),
  z.object({
    type: z.literal("freehand"),
    points: z.array(sketchPointSchema).min(2).max(2000),
  }),
]);

const lessonBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("theory"),
    text: z.string().trim().min(1).max(30000),
  }),
  z.object({
    type: z.literal("image"),
    url: z.string().url().max(2048).refine(isHttpsUrl, {
      message: "Ảnh phải dùng địa chỉ HTTPS.",
    }),
    alt: z.string().trim().min(1).max(200),
  }),
  z.object({
    type: z.literal("sketch"),
    title: z.string().trim().min(1).max(200),
    shapes: z.array(sketchShapeSchema).min(1).max(100),
  }),
  z.object({
    type: z.literal("simulation"),
    title: z.string().trim().min(1).max(200),
    url: z.string().url().max(2048).refine(isAllowedSimulationUrl, {
      message: "Chỉ hỗ trợ mô phỏng từ PhET hoặc GeoGebra.",
    }),
  }),
]);

const exerciseSchema = z
  .object({
    id: z.string().min(1).max(100),
    type: z.enum([
      "multiple_choice",
      "true_false",
      "short_answer",
      "essay",
    ]),
    prompt: z.string().trim().min(1).max(10000),
    options: z.array(z.string().trim().min(1).max(1000)).max(10).optional(),
    correctAnswer: z.string().trim().min(1).max(10000),
    explanation: z.string().trim().min(1).max(10000),
  })
  .superRefine((exercise, context) => {
    if (
      exercise.type === "multiple_choice" &&
      (!exercise.options ||
        exercise.options.length < 2 ||
        !/^\d+$/.test(exercise.correctAnswer) ||
        Number(exercise.correctAnswer) >= exercise.options.length)
    ) {
      context.addIssue({
        code: "custom",
        message: "Câu trắc nghiệm cần ít nhất 2 lựa chọn và đáp án hợp lệ.",
        path: ["options"],
      });
    }

    if (
      exercise.type === "true_false" &&
      exercise.correctAnswer !== "true" &&
      exercise.correctAnswer !== "false"
    ) {
      context.addIssue({
        code: "custom",
        message: "Câu đúng/sai cần chọn đáp án đúng.",
        path: ["correctAnswer"],
      });
    }
  });

export const lessonSchema = z
  .object({
    title: z.string().trim().min(3).max(200),
    description: z.string().trim().max(3000),
    subject: z.enum(SUBJECT_NAMES),
    topic: z.string().trim().min(1).max(120),
    blocks: z.array(lessonBlockSchema).min(1).max(30),
    exercises: z.array(exerciseSchema).min(1).max(100),
  })
  .superRefine((lesson, context) => {
    const ids = lesson.exercises.map((exercise) => exercise.id);
    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: "custom",
        message: "ID của các câu hỏi không được trùng nhau.",
        path: ["exercises"],
      });
    }
  });

export const focusSubjectsSchema = z.object({
  focusSubjects: z
    .array(z.enum(SUBJECT_NAMES))
    .min(1)
    .max(SUBJECT_NAMES.length)
    .refine((subjects) => new Set(subjects).size === subjects.length, {
      message: "Môn học không được chọn trùng.",
    }),
});

export type LessonInput = z.infer<typeof lessonSchema>;