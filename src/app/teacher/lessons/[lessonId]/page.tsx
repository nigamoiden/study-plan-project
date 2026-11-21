import LessonViewer from "@/features/learning-content/components/LessonViewer";

type PageProps = {
  params: Promise<{ lessonId: string }>;
};

export default async function TeacherLessonPreviewPage({
  params,
}: PageProps) {
  const { lessonId } = await params;
  return <LessonViewer lessonId={lessonId} previewOnly />;
}
