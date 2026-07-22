import { listPendingTasks } from "@/lib/services/tasks.service";
import { TaskItem } from "@/components/features/tasks/TaskItem";

export async function TasksSidebar() {
  const tasks = await listPendingTasks();

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-l border-gray-200 bg-white xl:flex">
      <div className="border-b border-gray-200 px-4 py-4">
        <h2 className="text-sm font-semibold text-gray-900">Tareas pendientes</h2>
        <p className="text-xs text-gray-500">{tasks.length} en total, por prioridad</p>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-500">No hay tareas pendientes.</p>
        ) : (
          tasks.map((task) => <TaskItem key={task.id} task={task} />)
        )}
      </div>
    </aside>
  );
}
