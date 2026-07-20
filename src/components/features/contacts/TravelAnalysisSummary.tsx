import { ANALYSIS_FIELDS, type TravelAnalysis } from "@/config/travel-analysis";

export function TravelAnalysisSummary({ analysis }: { analysis: TravelAnalysis | null }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-gray-900">Ficha resumen</h3>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {ANALYSIS_FIELDS.map((field) => {
          const value = analysis?.[field.key];
          return (
            <div key={field.key}>
              <dt className="text-xs font-medium uppercase text-gray-500">{field.label}</dt>
              <dd className={`text-sm ${value ? "text-gray-900" : "text-gray-400"}`}>
                {value || "No especificado"}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
