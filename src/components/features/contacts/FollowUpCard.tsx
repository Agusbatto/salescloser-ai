import { computeFollowUpStatus } from "@/config/follow-up";
import type { FollowUpSuggestion } from "@/types/follow-up";
import { Badge } from "@/components/ui/Badge";

interface FollowUpCardProps {
  lastContactAt: string | null;
  temperature: string | null | undefined;
  followUp: FollowUpSuggestion | null;
}

export function FollowUpCard({ lastContactAt, temperature, followUp }: FollowUpCardProps) {
  const status = computeFollowUpStatus(lastContactAt, temperature);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {status.daysSinceLastContact === null ? (
          <Badge label="Sin último contacto registrado" color="#6B7280" />
        ) : status.isOverdue ? (
          <Badge
            label={`⏰ Atrasado — ${status.daysSinceLastContact} días sin responder`}
            color="#EF4444"
          />
        ) : (
          <Badge
            label={`Al día — ${status.daysSinceLastContact} días sin responder`}
            color="#22C55E"
          />
        )}
        <span className="text-xs text-gray-500">
          Umbral para este cliente: {status.thresholdDays} días
        </span>
      </div>

      {followUp?.recommendedTiming || followUp?.message || followUp?.rationale ? (
        <div className="space-y-3">
          {followUp.recommendedTiming && (
            <div>
              <p className="text-xs font-medium uppercase text-gray-500">Cuándo escribir</p>
              <p className="text-sm text-gray-900">{followUp.recommendedTiming}</p>
            </div>
          )}

          {followUp.message && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-gray-500">
                Mensaje sugerido para retomar el contacto
              </p>
              <p className="whitespace-pre-wrap rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900">
                {followUp.message}
              </p>
            </div>
          )}

          {followUp.rationale && (
            <p className="text-xs text-gray-500">
              Por qué aumenta la probabilidad de cierre: {followUp.rationale}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Todavía no hay un seguimiento sugerido para esta conversación.
        </p>
      )}
    </div>
  );
}
