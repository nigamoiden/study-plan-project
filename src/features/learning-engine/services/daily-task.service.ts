export async function completeTask(taskId: string) {
  const response = await fetch(
    `/api/study-plan/tasks/${encodeURIComponent(taskId)}/complete`,
    { method: "POST", credentials: "same-origin" }
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Không thể hoàn thành nhiệm vụ.");
  return data;
}