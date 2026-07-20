/**
 * Metodologías de venta que el coach de IA debe conocer y combinar al
 * analizar una conversación. Única fuente de verdad: se inyecta en el
 * system prompt (`lib/ai/prompts.ts`).
 */
export const SALES_FRAMEWORKS = [
  "SPIN Selling",
  "AIDA",
  "BANT",
  "Challenger Sale",
  "Sandler",
  "Chris Voss (negociación táctica / FBI)",
  "Jordan Belfort (Straight Line System)",
  "Grant Cardone (10X)",
  "Brian Tracy",
  "Robert Cialdini (principios de persuasión)",
] as const;

/** Valores de temperatura que la IA devuelve (ver prompt del coach). Se reutilizan en el filtro del ranking. */
export const TEMPERATURE_OPTIONS = ["Frío", "Tibio", "Caliente"] as const;

/**
 * Heurística simple para colorear badges según el nivel devuelto por la
 * IA (alto/medio/bajo, caliente/tibio/frío, etc.) sin acoplar la UI a
 * un enum rígido — la IA puede devolver variantes de texto.
 */
export function toneColor(value: string | null | undefined): string {
  if (!value) return "#6B7280";
  const v = value.toLowerCase();
  if (/(alto|alta|caliente|urgente)/.test(v)) return "#EF4444";
  if (/(medio|media|tibio)/.test(v)) return "#F59E0B";
  if (/(bajo|baja|fr[ií]o)/.test(v)) return "#0EA5E9";
  return "#6366F1";
}

/**
 * Extrae un número 0-100 de un texto de probabilidad devuelto por la IA
 * (ej. "65%", "cerca del 70%"). Devuelve null si no hay ningún número.
 */
export function parsePurchaseProbability(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = value.match(/(\d{1,3})/);
  if (!match) return null;
  return Math.min(100, Number(match[1]));
}

/**
 * Score 0-100 usado para ordenar clientes por prioridad comercial.
 * Si la IA devolvió un porcentaje explícito, se usa tal cual. Si no,
 * se estima a partir de la temperatura. Clientes sin ningún análisis
 * todavía van al final (-1) en vez de mezclarse con probabilidad 0.
 */
export function getPriorityScore(analysis: {
  purchaseProbability?: string | null;
  temperature?: string | null;
} | null): number {
  if (!analysis) return -1;

  const explicit = parsePurchaseProbability(analysis.purchaseProbability);
  if (explicit !== null) return explicit;

  const temperature = analysis.temperature?.toLowerCase() ?? "";
  if (/caliente/.test(temperature)) return 70;
  if (/tibio/.test(temperature)) return 45;
  if (/fr[ií]o/.test(temperature)) return 15;

  return -1;
}
