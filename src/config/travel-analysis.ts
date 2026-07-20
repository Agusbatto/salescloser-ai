/**
 * Campos que el análisis automático de IA extrae de una conversación de
 * venta de viajes. Esta lista es la única fuente de verdad: se usa para
 * construir el prompt de extracción, la ficha resumen y el checklist de
 * información faltante. Agregar un campo nuevo acá alcanza para que se
 * propague a los tres lugares sin tocar más código.
 */
export const ANALYSIS_FIELDS = [
  { key: "clientName", label: "Nombre" },
  { key: "destination", label: "Destino" },
  { key: "passengersCount", label: "Cantidad de pasajeros" },
  { key: "minorsAges", label: "Edad de menores" },
  { key: "approximateDate", label: "Fecha aproximada" },
  { key: "nights", label: "Cantidad de noches" },
  { key: "budget", label: "Presupuesto" },
  { key: "requestedHotel", label: "Hotel solicitado" },
  { key: "tripType", label: "Tipo de viaje" },
  { key: "tripReason", label: "Motivo del viaje" },
  { key: "financing", label: "Financiación" },
  { key: "departureCity", label: "Ciudad de salida" },
  { key: "flexibility", label: "Flexibilidad" },
  { key: "requestedServices", label: "Servicios solicitados" },
  { key: "passportValid", label: "Pasaporte vigente" },
] as const;

export type AnalysisFieldKey = (typeof ANALYSIS_FIELDS)[number]["key"];

/** Valor extraído por campo: texto tal como aparece en la conversación, o null si no se menciona. */
export type TravelAnalysis = Partial<Record<AnalysisFieldKey, string | null>>;

export interface ChecklistItem {
  key: AnalysisFieldKey;
  label: string;
  present: boolean;
}

export function computeChecklist(analysis: TravelAnalysis | null): ChecklistItem[] {
  return ANALYSIS_FIELDS.map((field) => {
    const value = analysis?.[field.key];
    return {
      key: field.key,
      label: field.label,
      present: typeof value === "string" && value.trim().length > 0,
    };
  });
}

export function emptyAnalysis(): TravelAnalysis {
  return Object.fromEntries(ANALYSIS_FIELDS.map((f) => [f.key, null])) as TravelAnalysis;
}
