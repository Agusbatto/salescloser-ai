import type { SalesIntelligence } from "@/types/sales-intelligence";
import type { LevelAssessment } from "@/types/coach";
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

function TagList({ items, emptyLabel }: { items: string[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-400">{emptyLabel}</p>;
  }
  return (
    <ul className="list-inside list-disc space-y-0.5 text-sm text-gray-700">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function SalesIntelligenceCard({ data }: { data: SalesIntelligence | null }) {
  if (!data || (!data.stage && !data.executiveSummary)) {
    return (
      <p className="text-sm text-gray-500">
        Todavía no hay un diagnóstico de Sales Intelligence para esta conversación.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {data.executiveSummary && (
        <div className="rounded-md bg-gray-900 px-4 py-3">
          <p className="mb-1 text-xs font-medium uppercase text-gray-300">Resumen ejecutivo</p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-white">
            {data.executiveSummary}
          </p>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <dt className="text-xs font-medium uppercase text-gray-500">Etapa comercial</dt>
          <dd className="text-sm text-gray-900">{data.stage || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-gray-500">Temperatura</dt>
          <dd className="mt-0.5">
            {data.temperature ? (
              <Badge label={data.temperature} color={toneColor(data.temperature)} />
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-gray-500">Prob. de cierre</dt>
          <dd className="text-sm text-gray-900">{data.closingProbability || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-gray-500">Presupuesto detectado</dt>
          <dd className="text-sm text-gray-900">{data.budgetDetected || "—"}</dd>
        </div>
        <LevelBlock label="Riesgo de abandono" assessment={data.churnRisk} />
        <LevelBlock label="Confianza del cliente" assessment={data.clientConfidence} />
        <LevelBlock label="Urgencia" assessment={data.urgency} />
        <LevelBlock label="Intención de compra" assessment={data.purchaseIntent} />
      </dl>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <h4 className="mb-1 text-xs font-medium uppercase text-gray-500">Objeciones</h4>
          <TagList items={data.objections} emptyLabel="No se detectaron objeciones." />
        </div>
        <div>
          <h4 className="mb-1 text-xs font-medium uppercase text-gray-500">Emociones detectadas</h4>
          {data.emotions.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {data.emotions.map((emotion, i) => (
                <Badge key={i} label={emotion} color="#6366F1" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Sin señales claras.</p>
          )}
        </div>
      </div>

      {(data.nextAction || data.bestTechnique) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.nextAction && (
            <div className="rounded-md border border-gray-900 bg-gray-900 px-3 py-2.5">
              <p className="text-xs font-medium uppercase text-gray-300">
                Próxima acción recomendada
              </p>
              <p className="mt-0.5 text-sm text-white">{data.nextAction}</p>
            </div>
          )}
          {data.bestTechnique && (
            <div className="rounded-md border border-gray-200 px-3 py-2.5">
              <p className="text-xs font-medium uppercase text-gray-500">Mejor técnica de venta</p>
              <p className="mt-0.5 text-sm text-gray-900">{data.bestTechnique}</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <h4 className="mb-1 text-xs font-medium uppercase text-gray-500">
            Preguntas pendientes
          </h4>
          <TagList items={data.pendingQuestions} emptyLabel="No hay preguntas pendientes." />
        </div>
        <div>
          <h4 className="mb-1 text-xs font-medium uppercase text-gray-500">
            Información del viaje faltante
          </h4>
          <TagList items={data.missingTravelInfo} emptyLabel="No falta información." />
        </div>
      </div>
    </div>
  );
}
