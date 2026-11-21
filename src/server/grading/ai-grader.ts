type AIGradingInput = {
  prompt: string;
  answer: string;
  rubric: string[];
  maxScore: number;
};

export type AIGradingOutput = {
  score: number;
  feedback: string;
};

export function isAIGradingConfigured(): boolean {
  return Boolean(
    process.env.AI_GRADING_API_KEY &&
      process.env.AI_GRADING_API_URL &&
      process.env.AI_GRADING_MODEL
  );
}

export async function gradeWithAI(
  input: AIGradingInput
): Promise<AIGradingOutput | null> {
  if (!isAIGradingConfigured()) return null;

  const apiKey = process.env.AI_GRADING_API_KEY!;
  const apiUrl = process.env.AI_GRADING_API_URL!;
  const model = process.env.AI_GRADING_MODEL!;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Bạn là trợ lý chấm bài nghiêm túc. Chỉ trả JSON hợp lệ với dạng {\"score\": number, \"feedback\": string}. score là số nguyên từ 0 đến maxScore. Dựa trên rubric, không bịa đáp án ngoài dữ liệu được cung cấp.",
          },
          {
            role: "user",
            content: JSON.stringify({
              prompt: input.prompt,
              answer: input.answer,
              rubric: input.rubric,
              maxScore: input.maxScore,
            }),
          },
        ],
      }),
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const responseText = await response.text();
    if (!responseText.trim()) return null;

    const payload = JSON.parse(responseText) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as {
      score?: unknown;
      feedback?: unknown;
    };
    const score = typeof parsed.score === "number"
      ? Math.max(0, Math.min(input.maxScore, Math.round(parsed.score)))
      : null;

    if (score === null) return null;

    return {
      score,
      feedback:
        typeof parsed.feedback === "string" && parsed.feedback.trim()
          ? parsed.feedback.trim()
          : "Bài làm đã được hệ thống AI chấm.",
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
