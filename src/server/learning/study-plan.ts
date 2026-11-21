import "server-only";

import { z } from "zod";

import { adminDb } from "@/lib/firebase/admin";
import type {
  StudyPlan,
  StudyPlanTask,
} from "@/features/learning-engine/types/study-plan.types";
import type { SubjectName } from "@/features/onboarding/types/onboarding.types";

const profileSchema = z.object({
  academicGoal: z.object({
    targetMajor: z.string().trim().min(1),
    targetUniversity: z.string(),
  }),
  academicHistory: z.object({
    subjects: z
      .array(
        z.object({
          subject: z.enum([
            "math",
            "physics",
            "chemistry",
            "biology",
            "english",
            "literature",
            "history",
          ]),
          level: z.enum(["weak", "average", "good", "excellent"]),
          averageScore: z.number().min(0).max(10).nullable(),
        })
      )
      .min(1),
  }),
  studyFrequency: z.object({
    studyDaysPerWeek: z.number().int().min(1).max(7),
    studyMinutesPerDay: z.number().int().min(15).max(240),
  }),
  diagnosticTest: z
    .object({
      score: z.number().min(0).max(100),
      status: z.string(),
    })
    .optional(),
});

type OnboardingProfile = z.infer<typeof profileSchema>;

const subjectLabels: Record<SubjectName, string> = {
  math: "Toán học",
  physics: "Vật lý",
  chemistry: "Hóa học",
  biology: "Sinh học",
  english: "Tiếng Anh",
  literature: "Ngữ văn",
  history: "Lịch sử",
};

const stages = [
  {
    week: 1,
    title: "Củng cố nền tảng",
    description: "Ôn lại khái niệm trọng tâm và lấp các lỗ hổng kiến thức.",
  },
  {
    week: 2,
    title: "Nắm vững phương pháp",
    description: "Luyện các dạng bài cơ bản và hình thành cách giải ổn định.",
  },
  {
    week: 3,
    title: "Vận dụng kiến thức",
    description: "Kết hợp nhiều chủ đề và tăng dần độ khó của bài tập.",
  },
  {
    week: 4,
    title: "Ôn tập và đánh giá",
    description: "Ôn các nội dung còn yếu, tổng kết và chuẩn bị chặng tiếp theo.",
  },
] satisfies StudyPlan["stages"];

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function vietnameseDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function getPrioritizedSubjects(profile: OnboardingProfile): SubjectName[] {
  const weights = { weak: 4, average: 3, good: 2, excellent: 1 };

  return [...profile.academicHistory.subjects]
    .sort((left, right) => {
      const leftRisk =
        weights[left.level] +
        (left.averageScore === null ? 0 : (10 - left.averageScore) / 10) +
        (left.subject === "math" &&
        profile.diagnosticTest?.status === "graded"
          ? (100 - profile.diagnosticTest.score) / 100
          : 0);
      const rightRisk =
        weights[right.level] +
        (right.averageScore === null ? 0 : (10 - right.averageScore) / 10) +
        (right.subject === "math" &&
        profile.diagnosticTest?.status === "graded"
          ? (100 - profile.diagnosticTest.score) / 100
          : 0);

      return rightRisk - leftRisk;
    })
    .map((subject) => subject.subject);
}

function buildPlan(profile: OnboardingProfile, now: Date): StudyPlan {
  const start = new Date(`${vietnameseDateKey(now)}T00:00:00Z`);
  const prioritizedSubjects = getPrioritizedSubjects(profile);
  const studyDays = new Set(
    Array.from(
      { length: profile.studyFrequency.studyDaysPerWeek },
      (_, index) => Math.floor((index * 7) / profile.studyFrequency.studyDaysPerWeek)
    )
  );
  const tasks: StudyPlanTask[] = [];
  let studySession = 0;

  for (let day = 0; day < 28; day += 1) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + day);
    const weekday = (date.getUTCDay() + 6) % 7;

    if (!studyDays.has(weekday)) {
      continue;
    }

    const week = Math.floor(day / 7) + 1;
    const stage = stages[week - 1];
    const dateString = dateKey(date);

    const diagnosticScore = profile.diagnosticTest?.status === "graded"
      ? profile.diagnosticTest.score
      : 100;
    const needsMoreSessions =
      diagnosticScore < 40
        ? 3
        : diagnosticScore < 70
          ? 2
          : 1;
    const sessionsPerDay = Math.max(
      1,
      Math.min(
        4,
        needsMoreSessions,
        Math.max(1, Math.floor(profile.studyFrequency.studyMinutesPerDay / 30))
      )
    );
    const taskMinutes = Math.max(
      5,
      Math.floor(profile.studyFrequency.studyMinutesPerDay / sessionsPerDay)
    );

    for (let session = 0; session < sessionsPerDay; session += 1) {
      const sessionSubject =
        prioritizedSubjects[
          (studySession + session) % prioritizedSubjects.length
        ];
      const sessionLabel = subjectLabels[sessionSubject];
      const kind = session % 2 === 0 ? "learn" : "practice";

      tasks.push({
        id: `d${day + 1}-${sessionSubject}-${kind}-${session + 1}`,
        date: dateString,
        subject: sessionSubject,
        kind,
        title: kind === "learn"
          ? `Học trọng tâm ${sessionLabel}`
          : `Luyện tập ${sessionLabel}`,
        description: kind === "learn"
          ? `${stage.title}: ôn một khái niệm chính của ${sessionLabel} dựa trên kết quả khảo sát, ghi lại ví dụ và điểm còn yếu.`
          : `Làm bài ${sessionLabel} sau khi ôn lý thuyết; ưu tiên dạng bài gần kết quả khảo sát còn thấp.`,
        durationMinutes: taskMinutes,
        completed: false,
      });
    }
    studySession += sessionsPerDay;
  }

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 27);

  return {
    title: `Lộ trình 4 tuần: ${profile.academicGoal.targetMajor}`,
    targetMajor: profile.academicGoal.targetMajor,
    targetUniversity: profile.academicGoal.targetUniversity,
    studyDaysPerWeek: profile.studyFrequency.studyDaysPerWeek,
    studyMinutesPerDay: profile.studyFrequency.studyMinutesPerDay,
    generatedAt: now.toISOString(),
    startDate: dateKey(start),
    endDate: dateKey(end),
    stages,
    tasks,
  };
}

export class OnboardingRequiredError extends Error {
  constructor() {
    super("Hoàn thành hồ sơ học tập trước khi tạo lộ trình.");
    this.name = "OnboardingRequiredError";
  }
}

export async function ensureStudyPlan(uid: string): Promise<StudyPlan> {
  const userRef = adminDb.collection("users").doc(uid);
  const planRef = userRef.collection("studyPlans").doc("current");

  const plan = await adminDb.runTransaction(async (transaction) => {
    const [planSnapshot, userSnapshot] = await Promise.all([
      transaction.get(planRef),
      transaction.get(userRef),
    ]);

    if (planSnapshot.exists) {
      return planSnapshot.data() as StudyPlan;
    }

    const profileResult = profileSchema.safeParse(
      userSnapshot.data()?.onboarding
    );

    if (!profileResult.success) {
      throw new OnboardingRequiredError();
    }

    const plan = buildPlan(profileResult.data, new Date());
    transaction.create(planRef, plan);
    return plan;
  });

  const lessonSnapshot = await adminDb
    .collection("lessons")
    .where("status", "==", "published")
    .limit(200)
    .get();
  const lessonsBySubject = new Map<SubjectName, FirebaseFirestore.DocumentData[]>();

  for (const document of lessonSnapshot.docs) {
    const lesson = document.data();
    if (!lesson.subject) continue;
    const subjectLessons = lessonsBySubject.get(lesson.subject as SubjectName) ?? [];
    subjectLessons.push({ id: document.id, ...lesson });
    lessonsBySubject.set(lesson.subject as SubjectName, subjectLessons);
  }

  let changed = false;
  const tasks = plan.tasks.map((task) => {
    if (task.lessonId) return task;
    const lesson = lessonsBySubject
      .get(task.subject)
      ?.find((item) => item.status === "published");

    if (!lesson) return task;
    changed = true;
    return {
      ...task,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      title: task.kind === "learn"
        ? `Học: ${lesson.title}`
        : `Làm bài tập: ${lesson.title}`,
      description: task.kind === "learn"
        ? `${lesson.topic}: ${lesson.description || "Học kiến thức được giáo viên đăng tải."}`
        : `Hoàn thành các bài tập trong bài “${lesson.title}” sau khi xem xong kiến thức.`,
    };
  });

  if (changed) {
    const linkedPlan = { ...plan, tasks };
    await planRef.update({ tasks });
    return linkedPlan;
  }

  return plan;
}

export async function setStudyTaskCompletion(
  uid: string,
  taskId: string,
  completed: boolean
): Promise<StudyPlan | null> {
  const planRef = adminDb
    .collection("users")
    .doc(uid)
    .collection("studyPlans")
    .doc("current");
  const completedAt = completed ? new Date().toISOString() : null;

  return adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(planRef);

    if (!snapshot.exists) {
      return null;
    }

    const plan = snapshot.data() as StudyPlan;
    const taskIndex = plan.tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) {
      return null;
    }

    if (plan.tasks[taskIndex].completed === completed) {
      return plan;
    }

    const tasks = plan.tasks.map((task, index) =>
      index !== taskIndex
        ? task
        : completed
          ? { ...task, completed: true, completedAt: completedAt! }
          : (() => {
              const updatedTask = { ...task, completed: false };
              delete updatedTask.completedAt;
              return updatedTask;
            })()
    );
    const updatedPlan = { ...plan, tasks };

    transaction.update(planRef, { tasks });
    return updatedPlan;
  });
}
