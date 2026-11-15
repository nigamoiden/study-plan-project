import { z } from "zod";

export const manualGradeSchema = z.object({
  questionId: z.string().uuid(),
  points: z.number().min(0),
  feedback: z.string().optional(),
});

export const questionOptionSchema = z.object({
  id: z.string().min(1).max(100),
  content: z.string().min(1).max(5000),
});

export const questionSchema = z
  .object({
    id: z.string().min(1).max(100),
    subject: z.string().min(1).max(100),
    topic: z.string().max(200).optional(),

    type: z.enum([
      "multiple_choice",
      "true_false",
      "short_answer",
      "essay",
    ]),

    difficulty: z.enum(["easy", "medium", "hard"]),

    content: z.string().min(1).max(20000),

    options: z.array(questionOptionSchema).optional(),

    points: z.number().finite().positive().max(1000),

    imageUrl: z.string().url().optional(),
  })
  .superRefine((question, ctx) => {
    if (
      question.type === "multiple_choice" &&
      (!question.options || question.options.length < 2)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Câu hỏi trắc nghiệm phải có ít nhất 2 lựa chọn.",
        path: ["options"],
      });
    }

    if (question.options) {
      const ids = question.options.map((option) => option.id);

      if (new Set(ids).size !== ids.length) {
        ctx.addIssue({
          code: "custom",
          message: "ID của các lựa chọn không được trùng nhau.",
          path: ["options"],
        });
      }
    }
  });

export const questionAnswerSchema = z.discriminatedUnion("type", [
  z.object({
    questionId: z.string().min(1).max(100),
    type: z.literal("multiple_choice"),
    selectedOptionId: z.string().max(100).nullable(),
  }),

  z.object({
    questionId: z.string().min(1).max(100),
    type: z.literal("true_false"),
    selectedValue: z.boolean().nullable(),
  }),

  z.object({
    questionId: z.string().min(1).max(100),
    type: z.literal("short_answer"),
    answer: z.string().max(5000),
  }),

  z.object({
    questionId: z.string().min(1).max(100),
    type: z.literal("essay"),
    answer: z.string().max(20000),
  }),
]);

export const saveAnswersSchema = z.object({
  answers: z.array(questionAnswerSchema).max(500),
});

export const questionAnswerKeySchema = z.object({
  questionId: z.string().min(1).max(100),
  correctOptionId: z.string().max(100).optional(),
  correctBoolean: z.boolean().optional(),
  acceptedAnswers: z.array(z.string().max(5000)).max(100).optional(),
  explanation: z.string().max(5000).optional(),
});

export const createAssessmentSchema = z
  .object({
    title: z.string().trim().min(3).max(200),
    description: z.string().max(5000).optional(),
    subject: z.string().trim().min(1).max(100),
    durationMinutes: z.number().int().min(1).max(600),
    passingScore: z.number().min(0).max(100),
    maxAttempts: z.number().int().min(1).max(20).default(1),
    questions: z.array(questionSchema).min(1).max(200),
    answerKeys: z.array(questionAnswerKeySchema).min(1).max(200),
  })
  .superRefine((data, ctx) => {
    const questionMap = new Map(
      data.questions.map((question) => [question.id, question])
    );

    const keyIds = data.answerKeys.map((key) => key.questionId);

    if (new Set(keyIds).size !== keyIds.length) {
      ctx.addIssue({
        code: "custom",
        message: "Đáp án của một câu hỏi bị khai báo trùng.",
        path: ["answerKeys"],
      });
    }

    for (const key of data.answerKeys) {
      const question = questionMap.get(key.questionId);

      if (!question) {
        ctx.addIssue({
          code: "custom",
          message: `Không tìm thấy câu hỏi ${key.questionId}.`,
          path: ["answerKeys"],
        });
        continue;
      }

      if (question.type === "multiple_choice") {
        const valid = question.options?.some(
          (option) => option.id === key.correctOptionId
        );

        if (!valid) {
          ctx.addIssue({
            code: "custom",
            message: `Đáp án trắc nghiệm của câu ${question.id} không hợp lệ.`,
            path: ["answerKeys"],
          });
        }
      }

      if (
        question.type === "true_false" &&
        typeof key.correctBoolean !== "boolean"
      ) {
        ctx.addIssue({
          code: "custom",
          message: `Câu ${question.id} cần có đáp án đúng/sai.`,
          path: ["answerKeys"],
        });
      }

      if (
        question.type === "short_answer" &&
        (!key.acceptedAnswers || key.acceptedAnswers.length === 0)
      ) {
        ctx.addIssue({
          code: "custom",
          message: `Câu ${question.id} cần ít nhất một đáp án được chấp nhận.`,
          path: ["answerKeys"],
        });
      }
    }

    if (data.answerKeys.length !== data.questions.length) {
      ctx.addIssue({
        code: "custom",
        message: "Mỗi câu hỏi phải có một answer key, kể cả câu tự luận.",
        path: ["answerKeys"],
      });
    }
  });

export type CreateAssessmentInput = z.infer<
  typeof createAssessmentSchema
>;

export type SaveAnswersInput = z.infer<typeof saveAnswersSchema>;