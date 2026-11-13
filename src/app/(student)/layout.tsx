import { redirect } from "next/navigation";

import { requireUser } from "@/server/auth/require-user";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}