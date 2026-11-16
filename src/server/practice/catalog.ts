import "server-only";

import type { PracticeItem } from "@/features/practice/types/practice.types";

export const practiceCatalog: PracticeItem[] = [
  {
    id: "algebra-refresh",
    title: "Luyện đề Toán đại số",
    subject: "Toán học",
    durationMinutes: 25,
    difficulty: "medium",
    xp: 120,
    completed: 8,
    total: 12,
    passingScore: 70,
    description: "Ôn tập phương trình, bất phương trình và hệ phương trình.",
    tags: ["Cơ bản", "Trắc nghiệm", "Nhiệt huyết"],
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "Giải phương trình 2x + 5 = 13.",
        options: ["x = 2", "x = 3", "x = 4", "x = 5"],
        correctOptionId: "x = 4",
        rubric: ["Giải các bước tìm x", "Kiểm tra nghiệm lại"],
      },
      {
        id: "q2",
        type: "short_answer",
        prompt: "Phân tích đa thức 3x² - 12x = 0 theo dạng nhân tử.",
        acceptedAnswers: ["3x(x-4)=0", "x(x-4)=0", "x=0 hoặc x=4"],
        rubric: ["Nhận diện nhân tử chung", "Viết đúng dạng phân tích"],
      },
      {
        id: "q3",
        type: "essay",
        prompt: "Hãy giải thích vì sao nghiệm của phương trình 2x + 1 = 7 là x = 3 bằng ngôn ngữ dễ hiểu.",
        keywords: ["bước", "giải", "x", "3", "đúng"],
        rubric: ["Diễn giải rõ ràng", "Có phép biến đổi hợp lý"],
      },
    ],
  },
  {
    id: "ielts-reading",
    title: "Bài tập tiếng Anh đọc hiểu",
    subject: "Tiếng Anh",
    durationMinutes: 20,
    difficulty: "easy",
    xp: 90,
    completed: 5,
    total: 10,
    passingScore: 75,
    description: "Rèn kỹ năng đọc hiểu, từ vựng và cấu trúc câu.",
    tags: ["Reading", "Vocabulary"],
    questions: [
      {
        id: "r1",
        type: "multiple_choice",
        prompt: "Từ nào dưới đây có nghĩa gần nhất với 'beneficial'?",
        options: ["Hữu ích", "Hạn chế", "Lạ lẫm", "Không cần thiết"],
        correctOptionId: "Hữu ích",
        rubric: ["Hiểu nghĩa từ vựng"],
      },
      {
        id: "r2",
        type: "short_answer",
        prompt: "Viết một câu mô tả lợi ích của việc học đều đặn mỗi ngày.",
        acceptedAnswers: ["giúp cải thiện kiến thức", "giúp nâng cao hiệu quả học tập", "giúp tiến bộ"],
        rubric: ["Câu rõ nghĩa", "Có ý lợi ích"],
      },
    ],
  },
  {
    id: "react-debug",
    title: "Thực hành lập trình React",
    subject: "Khoa học máy tính",
    durationMinutes: 35,
    difficulty: "hard",
    xp: 180,
    completed: 3,
    total: 8,
    passingScore: 80,
    description: "Hoàn thiện state, props và xử lý hiệu ứng trong UI.",
    tags: ["React", "Logic", "Debug"],
    questions: [
      {
        id: "c1",
        type: "multiple_choice",
        prompt: "Trong React, state được sử dụng để:",
        options: [
          "Lưu dữ liệu thay đổi trong component",
          "Gọi API tự động",
          "Biến CSS thành JSX",
          "Không thể thay đổi sau render",
        ],
        correctOptionId: "Lưu dữ liệu thay đổi trong component",
        rubric: ["Hiểu vai trò state"],
      },
      {
        id: "c2",
        type: "essay",
        prompt: "Hãy mô tả cách bạn sẽ tối ưu một component React có dữ liệu cập nhật liên tục và dễ gây re-render không cần thiết.",
        keywords: ["memo", "useMemo", "useCallback", "state", "re-render", "tối ưu"],
        rubric: ["Nhận diện nguyên nhân re-render", "Đề xuất giải pháp tối ưu"],
      },
    ],
  },
  {
    id: "physics-core",
    title: "Tổng ôn Vật lý cơ bản",
    subject: "Vật lý",
    durationMinutes: 30,
    difficulty: "medium",
    xp: 140,
    completed: 7,
    total: 9,
    passingScore: 72,
    description: "Ôn lại động lực học, năng lượng và chuyển động.",
    tags: ["Vật lý", "Định luật"],
    questions: [
      {
        id: "p1",
        type: "multiple_choice",
        prompt: "Định luật Newton thứ hai phát biểu rằng:",
        options: [
          "Gia tốc tỉ lệ thuận với lực và tỉ lệ nghịch với khối lượng",
          "Mọi lực đều bằng nhau",
          "Khối lượng không đổi dưới mọi điều kiện",
          "Vận tốc luôn tăng đều",
        ],
        correctOptionId: "Gia tốc tỉ lệ thuận với lực và tỉ lệ nghịch với khối lượng",
        rubric: ["Hiểu định luật Newton thứ hai"],
      },
      {
        id: "p2",
        type: "short_answer",
        prompt: "Nêu ví dụ về chuyển động đều và chuyển động không đều.",
        acceptedAnswers: ["chuyển động đều là xe chạy trên đường thẳng với vận tốc không đổi", "chuyển động không đều là xe tăng tốc"],
        rubric: ["Phân biệt đúng chuyển động đều và không đều"],
      },
    ],
  },
];

export function getPracticeItems(): PracticeItem[] {
  return practiceCatalog;
}

export function getPublicPracticeItems(): PracticeItem[] {
  return practiceCatalog.map(toPublicPracticeItem);
}

export function getPracticeItemById(id: string): PracticeItem | undefined {
  return practiceCatalog.find((item) => item.id === id);
}

export function getPublicPracticeItemById(
  id: string
): PracticeItem | undefined {
  const practice = getPracticeItemById(id);
  return practice ? toPublicPracticeItem(practice) : undefined;
}

function toPublicPracticeItem(item: PracticeItem): PracticeItem {
  return {
    ...item,
    questions: item.questions.map((question) => {
      const publicQuestion = { ...question };
      delete publicQuestion.correctOptionId;
      delete publicQuestion.acceptedAnswers;
      delete publicQuestion.keywords;
      delete publicQuestion.rubric;
      return publicQuestion;
    }),
  };
}

