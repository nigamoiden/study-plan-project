import type { SubjectName } from "@/features/onboarding/types/onboarding.types";

export const SUBJECT_OPTIONS: Array<{
  value: SubjectName;
  label: string;
}> = [
  { value: "math", label: "Toán" },
  { value: "physics", label: "Vật lý" },
  { value: "chemistry", label: "Hóa học" },
  { value: "biology", label: "Sinh học" },
  { value: "english", label: "Tiếng Anh" },
  { value: "literature", label: "Ngữ văn" },
  { value: "history", label: "Lịch sử" },
];

export const SUBJECT_NAMES = SUBJECT_OPTIONS.map(
  (subject) => subject.value
) as [SubjectName, ...SubjectName[]];

const subjectNameSet = new Set<string>(SUBJECT_NAMES);

export function isSubjectName(value: unknown): value is SubjectName {
  return typeof value === "string" && subjectNameSet.has(value);
}

export const SUBJECT_LABELS = Object.fromEntries(
  SUBJECT_OPTIONS.map(({ value, label }) => [value, label])
) as Record<SubjectName, string>;

const SIMULATION_HOSTS = new Set([
  "phet.colorado.edu",
  "www.geogebra.org",
  "geogebra.org",
]);

export function isAllowedSimulationUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      SIMULATION_HOSTS.has(url.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}
