import Link from "next/link";
import type { Client } from "@/types/client";
import { toneColor, parsePurchaseProbability } from "@/config/coach";
import { computeFollowUpStatus } from "@/config/follow-up";
import { Badge } from "@/components/ui/Badge";

function formatDate(value: string | null) {
  if (!value) return "Sin contacto registrado";
  return new Date(value).toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function ClientPriorityCard({ client, rank }: { client: Client; rank: number }) {
  const coach = client.coachAnalysis;
  const probabilityNumber = parsePurchaseProbability(coach?.purchaseProbability);
  const followUpStatus = computeFollowUpStatus(client.lastContactAt, coach?.temperature);

  return (
    <Link
      href={`/contacts/${client.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
            {rank}
          </span>
          <div>
            <p className="text-sm font-medium text-gray-900">{client.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {coach?.temperature && (
                <Badge label={coach.temperature} color={toneColor(coach.temperature)} />
              )}
              {coach?.stage && <Badge label={coach.stage} color="#6366F1" />}
              {followUpStatus.isOverdue && <Badge label="⏰ Atrasado" color="#EF4444" />}
            </div>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xs uppercase text-gray-500">Prob. de cierre</p>
          <p className="text-2xl font-semibold text-gray-900">
            {probabilityNumber !== null ? `${probabilityNumber}%` : "—"}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 border-t border-gray-100 pt-3 text-xs sm:grid-cols-2">
        <div>
          <span className="text-gray-500">Último contacto: </span>
          <span className="text-gray-700">{formatDate(client.lastContactAt)}</span>
        </div>
        <div>
          <span className="text-gray-500">Próxima acción: </span>
          <span className="text-gray-700">{coach?.nextAction || "Sin análisis todavía"}</span>
        </div>
      </div>
    </Link>
  );
}
