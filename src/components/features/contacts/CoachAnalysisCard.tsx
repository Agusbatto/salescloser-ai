import type { CoachAnalysis, LevelAssessment } from "@/types/coach";
import { toneColor } from "@/config/coach";
import { Badge } from "@/components/ui/Badge";

function LevelBlock({ label, assessment }: { label: string; assessment: LevelAssessment | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-gray-500">{label}</dt>
      <dd className="mt-0.5">
        {assessment ? (
          <>
            <Badge label={assessment.level} color={toneColor(assessment.level)} />
            {assessment.note && <p className="mt-1 text-xs text-gray-600">{assessment.note}</p>}
          </>
        ) : (
          <span className="text-sm text-gray-400">Sin datos</span>
        )}
      </dd>
    </div>
  );
}

export function CoachAnalysisCard({ analysis }: { analysis: CoachAnalysis | null }) {
  if (!analysis || (!analysis.stage && analysis.suggestedResponses.length === 0)) {
    return (
      <p className="text-sm text-gray-500">
        Todavía no hay un análisis de venta para esta conversación.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {analysis.techniqueRationale && (
        <p className="rounded-md bg-gray-50 px-3 py-2 text-xs italic text-gray-600">
          Enfoque de la IA: {analysis.techniqueRationale}
        </p>
      )}

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase text-gray-500">Etapa del cliente</dt>
          <dd className="text-sm text-gray-900">{analysis.stage || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-gray-500">Temperatura</dt>
          <dd className="mt-0.5">
            {analysis.temperature ? (
              <Badge label={analysis.temperature} color={toneColor(analysis.temperature)} />
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-gray-500">Probabilidad de compra</dt>
          <dd className="text-sm text-gray-900">{analysis.purchaseProbability || "—"}</dd>
        </div>
        <LevelBlock label="Nivel de interés" assessment={analysis.interestLevel} />
        <LevelBlock label="Riesgo de abandono" assessment={analysis.churnRisk} />
        <LevelBlock label="Urgencia" assessment={analysis.urgency} />
      </dl>

      <div>
        <h4 className="text-xs font-medium uppercase text-gray-500">Objeciones detectadas</h4>
        {analysis.objections.length > 0 ? (
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm text-gray-700">
            {analysis.objections.map((objection, i) => (
              <li key={i}>{objection}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-gray-400">No se detectaron objeciones.</p>
        )}
      </div>

      {analysis.nextAction && (
        <div className="rounded-md border border-gray-900 bg-gray-900 px-3 py-2.5">
          <p className="text-xs font-medium uppercase text-gray-300">
            Próxima acción recomendada
          </p>
          <p className="mt-0.5 text-sm text-white">{analysis.nextAction}</p>
        </div>
      )}

      {analysis.suggestedResponses.length > 0 && (
        <div>
          <h4 className="mb-2 text-xs font-medium uppercase text-gray-500">
            Respuestas sugeridas
          </h4>
          <div className="space-y-3">
            {analysis.suggestedResponses.map((response, i) => (
              <div key={i} className="rounded-md border border-gray-200 p-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <Badge label={response.technique || `Opción ${i + 1}`} color="#6366F1" />
                </div>
                <p className="whitespace-pre-wrap text-sm text-gray-900">{response.message}</p>
                {response.rationale && (
                  <p className="mt-1.5 text-xs text-gray-500">Por qué: {response.rationale}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
