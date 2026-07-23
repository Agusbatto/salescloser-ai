export interface Task {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  /** El detalle concreto de qué hacer (ej. el mensaje ya redactado para mandarle al cliente). */
  description: string | null;
  status: "pending" | "done";
  dueDate: string;
  completedAt: string | null;
  createdAt: string;
  /** Score de prioridad del cliente dueño de la tarea (mismo cálculo que el ranking del dashboard). */
  priorityScore: number;
}
