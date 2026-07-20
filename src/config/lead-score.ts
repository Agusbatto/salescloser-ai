/**
 * Factores que componen la puntuación de 0-100 de un lead. Única fuente
 * de verdad: se usa para construir el prompt de la IA y para renderizar
 * el detalle de "por qué obtuvo ese puntaje" en la UI, en el mismo orden.
 */
export const SCORE_FACTORS = [
  { key: "messageCount", label: "Cantidad de mensajes" },
  { key: "timeSinceLastMessage", label: "Tiempo desde el último mensaje" },
  { key: "interestLevel", label: "Nivel de interés" },
  { key: "questionCount", label: "Cantidad de preguntas" },
  { key: "budgetInformed", label: "Presupuesto informado" },
  { key: "destinationDefined", label: "Destino definido" },
  { key: "datesDefined", label: "Fechas definidas" },
  { key: "objections", label: "Objeciones" },
  { key: "urgency", label: "Urgencia" },
  { key: "purchaseIntent", label: "Intención de compra" },
  { key: "competitorComparison", label: "Comparación con otras agencias" },
  { key: "emotionsDetected", label: "Emociones detectadas" },
] as const;

export type ScoreFactorKey = (typeof SCORE_FACTORS)[number]["key"];

export function getScoreColor(score: number | null): string {
  if (score === null) return "#6B7280";
  if (score >= 70) return "#22C55E";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
}

export function getFactorLabel(key: string): string {
  return SCORE_FACTORS.find((f) => f.key === key)?.label ?? key;
}
