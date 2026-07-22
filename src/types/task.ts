export interface Task {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  status: "pending" | "done";
  dueDate: string;
  completedAt: string | null;
  createdAt: string;
  /** Score de prioridad del cliente dueño de la tarea (mismo cálculo que el ranking del dashboard). */
  priorityScore: number;
}
