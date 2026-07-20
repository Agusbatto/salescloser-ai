import { getEventMeta } from "@/config/timeline";
import type { ClientEvent } from "@/types/timeline";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ClientTimeline({ events }: { events: ClientEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-gray-500">Todavía no hay eventos registrados para este cliente.</p>
    );
  }

  return (
    <ol className="space-y-4">
      {events.map((event) => {
        const meta = getEventMeta(event.type);
        return (
          <li key={event.id} className="flex gap-3">
            <span
              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: meta.color }}
            />
            <div>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="text-sm font-medium text-gray-900">{meta.label}</p>
                <span className="text-xs text-gray-400">{formatDateTime(event.occurredAt)}</span>
              </div>
              {event.description && (
                <p className="text-sm text-gray-600">{event.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
