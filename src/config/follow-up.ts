import { daysSince } from "@/lib/utils/conversation-metrics";

/**
 * Umbral de días sin respuesta a partir del cual se considera que un
 * cliente "lleva demasiado tiempo sin responder", según su temperatura.
 * Un cliente caliente se enfría mucho más rápido que uno frío.
 */
const FOLLOW_UP_THRESHOLD_DAYS: Record<string, number> = {
  "caliente": 2,
  "tibio": 4,
  "frío": 7,
  "frio": 7,
};

const DEFAULT_FOLLOW_UP_THRESHOLD_DAYS = 5;

export function getFollowUpThreshold(temperature: string | null | undefined): number {
  if (!temperature) return DEFAULT_FOLLOW_UP_THRESHOLD_DAYS;
  return FOLLOW_UP_THRESHOLD_DAYS[temperature.trim().toLowerCase()] ?? DEFAULT_FOLLOW_UP_THRESHOLD_DAYS;
}

export interface FollowUpStatus {
  daysSinceLastContact: number | null;
  thresholdDays: number;
  isOverdue: boolean;
}

/**
 * Detección 100% determinística (sin IA) de si un cliente está atrasado
 * de seguimiento. Se calcula en cada render a partir de `lastContactAt`,
 * así que nunca queda desactualizada aunque no se vuelva a analizar la
 * conversación — a diferencia del mensaje sugerido, que sí requiere IA.
 */
export function computeFollowUpStatus(
  lastContactAt: string | null | undefined,
  temperature: string | null | undefined,
): FollowUpStatus {
  const thresholdDays = getFollowUpThreshold(temperature);
  const daysSinceLastContact = daysSince(lastContactAt);
  return {
    daysSinceLastContact,
    thresholdDays,
    isOverdue: daysSinceLastContact !== null && daysSinceLastContact >= thresholdDays,
  };
}
