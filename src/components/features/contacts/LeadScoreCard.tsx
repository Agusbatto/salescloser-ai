import type { LeadScore } from "@/types/lead-score";
import { getScoreColor, getFactorLabel } from "@/config/lead-score";

const IMPACT_ICON: Record<string, string> = {
  positive: "▲",
  negative: "▼",
  neutral: "●",
};

const IMPACT_COLOR: Record<string, string> = {
  positive: "text-green-600",
  negative: "text-red-500",
  neutral: "text-gray-400",
};

export function LeadScoreCard({ leadScore }: { leadScore: LeadScore | null }) {
  if (!leadScore || leadScore.score === null) {
    return (
      <p className="text-sm text-gray-500">Todavía no hay un puntaje calculado para este lead.</p>
    );
  }

  const color = getScoreColor(leadScore.score);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          {leadScore.score}
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-gray-500">Puntaje del lead (0-100)</p>
          {leadScore.summary && <p className="mt-0.5 text-sm text-gray-700">{leadScore.summary}</p>}
        </div>
      </div>

      {leadScore.factors.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase text-gray-500">
            Por qué obtuvo este puntaje
          </h4>
          <ul className="space-y-1.5">
            {leadScore.factors.map((factor) => (
              <li key={factor.key} className="flex items-start gap-2 text-sm">
                <span className={`mt-0.5 shrink-0 ${IMPACT_COLOR[factor.impact]}`}>
                  {IMPACT_ICON[factor.impact]}
                </span>
                <span>
                  <span className="font-medium text-gray-900">{getFactorLabel(factor.key)}:</span>{" "}
                  <span className="text-gray-600">{factor.note || "Sin datos suficientes"}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
