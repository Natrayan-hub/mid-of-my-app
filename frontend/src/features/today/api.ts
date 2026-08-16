// Today-screen API calls — thin, typed wrappers over the shared client,
// matching the endpoints in the API design (B.3 tasks, B.4 health).
import { api } from "@/src/api/client";
import type { HealthEntry, Task } from "@/src/types/models";

export async function fetchTodayTasks(): Promise<Task[]> {
  const res = await api.get<{ items: Task[] }>("/tasks", { bucket: "today" });
  return res.items;
}

export async function completeTask(taskId: string): Promise<Task> {
  return api.post<Task>(`/tasks/${taskId}/complete`);
}

export async function reopenTask(taskId: string): Promise<Task> {
  return api.post<Task>(`/tasks/${taskId}/reopen`);
}

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function fetchWaterToday(): Promise<HealthEntry[]> {
  const res = await api.get<{ items: HealthEntry[] }>("/health/entries", {
    type: "water",
    from_: startOfTodayIso(),
  });
  return res.items;
}

export async function addWater(ml: number): Promise<HealthEntry> {
  return api.post<HealthEntry>("/health/entries", { type: "water", value: ml });
}
