"use server";

import { revalidatePath } from "next/cache";
import { completeTask } from "@/lib/services/tasks.service";

export async function completeTaskAction(taskId: string): Promise<void> {
  await completeTask(taskId);
  // La barra de tareas vive en el layout, visible en toda la app —
  // revalidar todo el segmento privado en vez de una sola página.
  revalidatePath("/", "layout");
}
