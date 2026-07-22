import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getPriorityScore } from "@/config/coach";
import type { Task } from "@/types/task";

interface TaskRow {
  id: string;
  client_id: string;
  title: string;
  status: string;
  due_date: string;
  completed_at: string | null;
  created_at: string;
  clients: { name: string; coach_analysis: { temperature?: string; purchaseProbability?: string } | null } | null;
}

const TASK_SELECT = `
  id, client_id, title, status, due_date, completed_at, created_at,
  clients ( name, coach_analysis )
`;

/** Tareas pendientes del usuario, ordenadas: atrasadas primero, después por prioridad del cliente. */
export async function listPendingTasks(): Promise<Task[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("status", "pending")
    .order("due_date", { ascending: true });

  if (error) throw new Error(`No se pudieron obtener las tareas: ${error.message}`);

  const today = new Date().toISOString().slice(0, 10);

  const tasks: Task[] = (data as unknown as TaskRow[]).map((row) => ({
    id: row.id,
    clientId: row.client_id,
    clientName: row.clients?.name ?? "Cliente",
    title: row.title,
    status: row.status === "done" ? "done" : "pending",
    dueDate: row.due_date,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    priorityScore: getPriorityScore(row.clients?.coach_analysis ?? null),
  }));

  return tasks.sort((a, b) => {
    const aOverdue = a.dueDate < today;
    const bOverdue = b.dueDate < today;
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    return a.dueDate.localeCompare(b.dueDate);
  });
}

export async function createTask(
  clientId: string,
  ownerId: string,
  title: string,
  dueDate?: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    client_id: clientId,
    owner_id: ownerId,
    title,
    due_date: dueDate ?? new Date().toISOString().slice(0, 10),
  });
  if (error) throw new Error(`No se pudo crear la tarea: ${error.message}`);
}

export async function completeTask(taskId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("id", taskId);
  if (error) throw new Error(`No se pudo completar la tarea: ${error.message}`);
}
