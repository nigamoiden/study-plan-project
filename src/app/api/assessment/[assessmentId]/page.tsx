
import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/require-user";
import AssessmentPlayer from "@/features/assessment/components/AssessmentPlayer";

interface Props {
  params: Promise<{
    assessmentId: string;
  }>;
}

export default async function AssessmentPage({ params }: Props) {
  const user = await requireUser();

  if (!user) {
    redirect("/login");
  }

  const { assessmentId } = await params;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <AssessmentPlayer assessmentId={assessmentId} />
    </div>
  );
}
