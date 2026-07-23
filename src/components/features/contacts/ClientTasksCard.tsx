import { listPendingTasksForClient } from "@/lib/services/tasks.service";
import { completeTaskAction } from "@/app/(dashboard)/actions";

export async function ClientTasksCard({ clientId }: { clientId: string }) {
  const tasks = await listPendingTasksForClient(clientId);

  if (tasks.length === 0) {
    return <p className="text-sm text-gray-500">No hay tareas pendientes para este cliente.</p>;
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-start gap-2 rounded-md border border-gray-200 p-3">
          <form action={completeTaskAction.bind(null, task.id)}>
            <button
              type="submit"
              title="Marcar como hecha"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border border-gray-300 hover:border-gray-900 hover:bg-gray-100"
            />
          </form>
          <div>
            <p className="text-sm font-medium text-gray-900">{task.title}</p>
            {task.description && (
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-gray-600">
                {task.description}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
