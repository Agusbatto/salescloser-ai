"use client";

import Link from "next/link";
import { completeTaskAction } from "@/app/(dashboard)/actions";
import type { Task } from "@/types/task";

export function TaskItem({ task }: { task: Task }) {
  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = task.dueDate < today;

  return (
    <div className="rounded-md border border-gray-200 p-2.5">
      <div className="flex items-start gap-2">
        <form action={completeTaskAction.bind(null, task.id)}>
          <button
            type="submit"
            title="Marcar como hecha"
            className="mt-0.5 h-4 w-4 shrink-0 rounded border border-gray-300 hover:border-gray-900 hover:bg-gray-100"
          />
        </form>
        <div className="min-w-0 flex-1">
          <Link
            href={`/contacts/${task.clientId}`}
            className="block truncate text-xs font-medium text-gray-900 hover:underline"
          >
            {task.clientName}
          </Link>
          <p className="text-xs text-gray-600">{task.title}</p>
          {isOverdue && (
            <span className="mt-0.5 inline-block text-[10px] font-medium text-red-600">
              Atrasada
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
