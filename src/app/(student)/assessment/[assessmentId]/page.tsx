import { notFound } from "next/navigation";

import AssessmentPlayer from "@/features/assessment/components/AssessmentPlayer";

interface Props {
  params: Promise<{ assessmentId: string }>;
}

export default async function AssessmentPage({ params }: Props) {
  const { assessmentId } = await params;
  if (!assessmentId) notFound();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <AssessmentPlayer assessmentId={assessmentId} />
    </div>
  );
}
