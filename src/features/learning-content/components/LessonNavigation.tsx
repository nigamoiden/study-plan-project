import Link from "next/link";

export default function LessonNavigation({ lessonId }: { lessonId: string }) {
  return (
    <nav className="flex items-center justify-between text-sm">
      <Link href="/lessons" className="font-semibold text-violet-700">← Thư viện</Link>
      <Link href={`/lessons/${lessonId}#bai-tap`} className="font-semibold text-violet-700">Làm bài tập →</Link>
    </nav>
  );
}