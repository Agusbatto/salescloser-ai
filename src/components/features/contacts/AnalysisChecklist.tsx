import { computeChecklist, type TravelAnalysis } from "@/config/travel-analysis";

export function AnalysisChecklist({ analysis }: { analysis: TravelAnalysis | null }) {
  const items = computeChecklist(analysis);
  const missingCount = items.filter((i) => !i.present).length;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Checklist de información</h3>
        <span className="text-xs text-gray-500">
          {missingCount === 0 ? "Completo" : `Falta ${missingCount}`}
        </span>
      </div>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.key}
            className={`flex items-center gap-2 text-sm ${
              item.present ? "text-gray-700" : "text-gray-500"
            }`}
          >
            <span className={item.present ? "text-green-600" : "text-red-500"}>
              {item.present ? "✔" : "❌"}
            </span>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
