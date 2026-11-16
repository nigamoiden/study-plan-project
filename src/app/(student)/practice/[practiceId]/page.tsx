import PracticeSession from "@/features/practice/components/PracticeSession";

type PageProps = {
  params: Promise<{ practiceId: string }>;
};

export default async function PracticeDetailPage({ params }: PageProps) {
  const { practiceId } = await params;

  return <PracticeSession practiceId={practiceId} />;
}
