import LessonEditor from "@/features/learning-content/components/LessonEditor";

export default function NewLessonPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-violet-600">
          Khu vực giáo viên
        </p>
        <h1 className="mt-1 text-3xl font-bold">Soạn và đăng bài học</h1>
        <p className="mt-2 text-slate-600">
          Bài sẽ được xuất bản ngay và chỉ hiện với học sinh đã chọn môn tương ứng.
        </p>
      </header>
      <LessonEditor />
    </main>
  );
}
