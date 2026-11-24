export type ContentRole = "student" | "teacher" | "admin" | "super_admin";

export function canManageAuthoredContent(
  actorRole: ContentRole | string,
  actorUid: string,
  creatorUid: string | undefined,
  creatorRole: ContentRole | string | undefined
): boolean {
  if (actorRole === "super_admin") return true;
  if (actorRole === "admin") {
    return creatorRole !== undefined && creatorRole !== "super_admin";
  }
  return actorRole === "teacher" && creatorUid === actorUid;
}
