const identityFields = new Set([
  "uid",
  "userId",
  "studentId",
  "teacherId",
  "ownerId",
  "createdBy",
  "reviewedBy",
]);

export function containsClientIdentityField(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(containsClientIdentityField);
  }

  if (typeof value === "object" && value !== null) {
    return Object.entries(value).some(([key, nestedValue]) =>
      identityFields.has(key) || containsClientIdentityField(nestedValue)
    );
  }

  return false;
}
