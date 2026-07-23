import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getPriorityScore } from "@/config/coach";
import type { Task } from "@/types/task";

interface TaskRow {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string;
  completed_at: string | null;
  created_at: string;
  clients: { name: string; coach_analysis: { temperature?: string; purchaseProbability?: string } | null } | null;
}

const TASK_SELECT = `
  id, client_id, title, description, status, due_date, completed_at, created_at,
  clients ( name, coach_analysis )
`;

function mapTaskRow(row: TaskRow): Task {
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.clients?.name ?? "Cliente",
    title: row.title,
    description: row.description,
    status: row.status === "done" ? "done" : "pending",
    dueDate: row.due_date,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    priorityScore: getPriorityScore(row.clients?.coach_analysis ?? null),
  };
}

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
  const tasks = (data as unknown as TaskRow[]).map(mapTaskRow);

  return tasks.sort((a, b) => {
    const aOverdue = a.dueDate < today;
    const bOverdue = b.dueDate < today;
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    return a.dueDate.localeCompare(b.dueDate);
  });
}

/** Tareas pendientes de un cliente puntual — para mostrar en su ficha, con el detalle de qué hacer. */
export async function listPendingTasksForClient(clientId: string): Promise<Task[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_SELECT)
    .eq("client_id", clientId)
    .eq("status", "pending")
    .order("due_date", { ascending: true });

  if (error) throw new Error(`No se pudieron obtener las tareas del cliente: ${error.message}`);
  return (data as unknown as TaskRow[]).map(mapTaskRow);
}

export interface ClientTaskCount {
  clientId: string;
  clientName: string;
  count: number;
  priorityScore: number;
}

/**
 * Tareas pendientes agrupadas por cliente — para la barra lateral
 * simplificada: un nombre de pasajero con un número al lado, ordenado
 * por probabilidad de cierre (no por fecha de vencimiento).
 */
export async function listPendingTaskCountsByClient(): Promise<ClientTaskCount[]> {
  const tasks = await listPendingTasks();

  const byClient = new Map<string, ClientTaskCount>();
  for (const task of tasks) {
    const existing = byClient.get(task.clientId);
    if (existing) {
      existing.count += 1;
    } else {
      byClient.set(task.clientId, {
        clientId: task.clientId,
        clientName: task.clientName,
        count: 1,
        priorityScore: task.priorityScore,
      });
    }
  }

  return Array.from(byClient.values()).sort((a, b) => b.priorityScore - a.priorityScore);
}

/** Cantidad de tareas pendientes por cliente — para mostrar en el listado de Clientes. */
export async function getPendingTaskCountMap(): Promise<Record<string, number>> {
  const tasks = await listPendingTasks();
  const counts: Record<string, number> = {};
  for (const task of tasks) {
    counts[task.clientId] = (counts[task.clientId] ?? 0) + 1;
  }
  return counts;
}

export async function createTask(
  clientId: string,
  ownerId: string,
  title: string,
  description?: string | null,
  dueDate?: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    client_id: clientId,
    owner_id: ownerId,
    title,
    description: description ?? null,
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
