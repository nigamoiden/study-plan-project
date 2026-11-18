import LessonViewer from "@/features/learning-content/components/LessonViewer";

type PageProps = {
  params: Promise<{ lessonId: string }>;
};

export default async function LessonPage({ params }: PageProps) {
  const { lessonId } = await params;
  return <LessonViewer lessonId={lessonId} />;
}
