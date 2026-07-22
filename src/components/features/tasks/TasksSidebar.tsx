import Link from "next/link";
import { listPendingTaskCountsByClient } from "@/lib/services/tasks.service";

export async function TasksSidebar() {
  const items = await listPendingTaskCountsByClient();

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-l border-gray-200 bg-white xl:flex">
      <div className="border-b border-gray-200 px-4 py-4">
        <h2 className="text-sm font-semibold text-gray-900">Tareas</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">No hay tareas pendientes.</p>
        ) : (
          <ul className="space-y-0.5">
            {items.map((item) => (
              <li key={item.clientId}>
                <Link
                  href={`/contacts/${item.clientId}`}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  <span className="truncate">{item.clientName}</span>
                  <span className="ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-gray-900 px-1 text-xs font-medium text-white">
                    {item.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
