import type {
  AdminUser,
  ContentItem,
  DashboardMetric,
  GradingTask,
  QuestionItem,
  SubjectItem,
  TeacherAccount,
} from "../types/admin.types";

export function getDashboardMetrics(): DashboardMetric[] {
  return [
    {
      label: "Tổng người dùng",
      value: "2,480",
      description: "Người dùng hoạt động trong 30 ngày qua",
      trend: "+12.4%",
      positive: true,
    },
    {
      label: "Giảng viên đang hoạt động",
      value: "148",
      description: "Trong số 172 tài khoản giảng viên",
      trend: "+4.8%",
      positive: true,
    },
    {
      label: "Khóa học đang mở",
      value: "39",
      description: "Tổng số môn học và lộ trình học",
      trend: "+7.2%",
      positive: true,
    },
    {
      label: "Bài kiểm tra cần chấm",
      value: "26",
      description: "Các kết quả đang chờ phê duyệt",
      trend: "-3.1%",
      positive: false,
    },
  ];
}

export function getUserManagementData(): AdminUser[] {
  return [
    {
      id: "USR-101",
      name: "Nguyễn Thị Lan",
      email: "lan.nguyen@example.com",
      role: "student",
      department: "Công nghệ thông tin",
      status: "active",
      lastLogin: "2 giờ trước",
    },
    {
      id: "USR-102",
      name: "Trần Văn Hùng",
      email: "hung.tran@example.com",
      role: "teacher",
      department: "Toán học",
      status: "active",
      lastLogin: "15 phút trước",
    },
    {
      id: "USR-103",
      name: "Phạm Duy Khánh",
      email: "khanh.pham@example.com",
      role: "student",
      department: "Kinh tế",
      status: "pending",
      lastLogin: "1 ngày trước",
    },
    {
      id: "USR-104",
      name: "Lê Minh Anh",
      email: "anh.le@example.com",
      role: "admin",
      department: "Quản trị",
      status: "active",
      lastLogin: "5 phút trước",
    },
    {
      id: "USR-105",
      name: "Võ Ngọc Mai",
      email: "mai.vo@example.com",
      role: "student",
      department: "Marketing",
      status: "suspended",
      lastLogin: "12 ngày trước",
    },
  ];
}

export function getTeacherManagementData(): TeacherAccount[] {
  return [
    {
      id: "TCH-201",
      name: "Trần Văn Hùng",
      email: "hung.tran@example.com",
      department: "Toán học",
      subjects: ["Toán cao cấp", "Xác suất thống kê"],
      status: "active",
      approvals: 18,
    },
    {
      id: "TCH-202",
      name: "Phan Hoàng Nam",
      email: "nam.phan@example.com",
      department: "Khoa học máy tính",
      subjects: ["Lập trình web", "Cấu trúc dữ liệu"],
      status: "pending",
      approvals: 7,
    },
    {
      id: "TCH-203",
      name: "Đỗ Thị Yến",
      email: "yen.do@example.com",
      department: "Ngôn ngữ",
      subjects: ["Tiếng Anh chuyên ngành"],
      status: "active",
      approvals: 11,
    },
  ];
}

export function getSubjectManagementData(): SubjectItem[] {
  return [
    {
      id: "SUB-301",
      name: "Toán cao cấp",
      code: "MATH101",
      instructorCount: 8,
      studentCount: 520,
      status: "active",
    },
    {
      id: "SUB-302",
      name: "Lập trình web",
      code: "WEB201",
      instructorCount: 6,
      studentCount: 410,
      status: "active",
    },
    {
      id: "SUB-303",
      name: "Kỹ năng thuyết trình",
      code: "COMM104",
      instructorCount: 3,
      studentCount: 240,
      status: "draft",
    },
    {
      id: "SUB-304",
      name: "Hệ điều hành",
      code: "OS301",
      instructorCount: 4,
      studentCount: 180,
      status: "archived",
    },
  ];
}

export function getQuestionBankData(): QuestionItem[] {
  return [
    {
      id: "Q-401",
      subject: "Toán cao cấp",
      topic: "Đạo hàm và tích phân",
      type: "multiple_choice",
      difficulty: "medium",
      status: "approved",
    },
    {
      id: "Q-402",
      subject: "Lập trình web",
      topic: "React component lifecycle",
      type: "essay",
      difficulty: "hard",
      status: "in_review",
    },
    {
      id: "Q-403",
      subject: "Tiếng Anh",
      topic: "Reading comprehension",
      type: "short_answer",
      difficulty: "easy",
      status: "draft",
    },
    {
      id: "Q-404",
      subject: "Vật lý",
      topic: "Định luật Ohm",
      type: "true_false",
      difficulty: "easy",
      status: "approved",
    },
  ];
}

export function getContentManagementData(): ContentItem[] {
  return [
    {
      id: "CNT-501",
      title: "Bài 3: Thuật toán tối ưu",
      type: "lesson",
      owner: "Phan Hoàng Nam",
      status: "approved",
      lastUpdated: "Hôm qua",
    },
    {
      id: "CNT-502",
      title: "Khóa học Web Front-end",
      type: "course",
      owner: "Trần Văn Hùng",
      status: "in_review",
      lastUpdated: "3 ngày trước",
    },
    {
      id: "CNT-503",
      title: "Mini assessment: Kiểm tra kiến thức",
      type: "assessment",
      owner: "Đỗ Thị Yến",
      status: "draft",
      lastUpdated: "1 tuần trước",
    },
  ];
}

export function getGradingReviewData(): GradingTask[] {
  return [
    {
      id: "GR-601",
      student: "Lê Văn Minh",
      subject: "Lập trình web",
      score: "88/100",
      status: "needs_review",
      due: "Trong 2 giờ",
    },
    {
      id: "GR-602",
      student: "Nguyễn Thanh Hòa",
      subject: "Toán cao cấp",
      score: "92/100",
      status: "submitted",
      due: "Hôm nay",
    },
    {
      id: "GR-603",
      student: "Bùi Hoài An",
      subject: "Vật lý",
      score: "75/100",
      status: "auto_graded",
      due: "Đã hoàn tất",
    },
  ];
}
