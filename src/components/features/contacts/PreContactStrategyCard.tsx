import type { PreContactStrategy } from "@/types/pre-contact";
import { Badge } from "@/components/ui/Badge";

export function PreContactStrategyCard({ strategy }: { strategy: PreContactStrategy | null }) {
  if (!strategy || (!strategy.approach && strategy.recommendedQuestions.length === 0)) {
    return (
      <p className="text-sm text-gray-500">
        Todavía no hay una estrategia de primer contacto generada para este cliente.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {strategy.callType && <Badge label={strategy.callType} color="#6366F1" />}
        {strategy.tone && <Badge label={strategy.tone} color="#0EA5E9" />}
      </div>

      {strategy.approach && (
        <div>
          <p className="text-xs font-medium uppercase text-gray-500">Cómo atacar la consulta</p>
          <p className="text-sm text-gray-900">{strategy.approach}</p>
        </div>
      )}

      {strategy.firstContactGoal && (
        <div>
          <p className="text-xs font-medium uppercase text-gray-500">
            Objetivo del primer contacto
          </p>
          <p className="text-sm text-gray-900">{strategy.firstContactGoal}</p>
        </div>
      )}

      {strategy.recommendedQuestions.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase text-gray-500">
            Preguntas recomendadas, en orden
          </p>
          <ol className="space-y-2">
            {[...strategy.recommendedQuestions]
              .sort((a, b) => a.order - b.order)
              .map((q, i) => (
                <li key={i} className="rounded-md border border-gray-200 p-2.5">
                  <p className="text-sm font-medium text-gray-900">
                    {q.order}. {q.question}
                  </p>
                  {q.reason && <p className="mt-0.5 text-xs text-gray-500">Por qué: {q.reason}</p>}
                </li>
              ))}
          </ol>
        </div>
      )}

      {strategy.infoToCollect.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-medium uppercase text-gray-500">
            Información a recolectar antes de cotizar
          </p>
          <ul className="list-inside list-disc space-y-0.5 text-sm text-gray-700">
            {strategy.infoToCollect.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
