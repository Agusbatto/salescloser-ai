import type { ConversationMetrics } from "@/types/lead-score";

/** Días transcurridos desde una fecha ISO hasta ahora, o null si no hay fecha. */
export function daysSince(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const diffMs = Date.now() - new Date(dateStr).getTime();
  if (Number.isNaN(diffMs)) return null;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Calcula en código (no con IA) las métricas objetivas que alimentan el
 * scoring del lead: cantidad de mensajes, cantidad de preguntas y días
 * desde el último contacto. Son deterministas y gratis — no tiene
 * sentido pagarle a la IA por contar líneas.
 *
 * `messageCount` es una aproximación: cuenta líneas no vacías del texto
 * pegado, ya que no hay un formato fijo de conversación.
 */
export function computeConversationMetrics(
  conversation: string | null | undefined,
  lastContactAt: string | null | undefined,
): ConversationMetrics {
  const text = conversation ?? "";

  const messageCount = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0).length;

  const questionCount = (text.match(/\?/g) ?? []).length;

  return { messageCount, questionCount, daysSinceLastContact: daysSince(lastContactAt) };
}
