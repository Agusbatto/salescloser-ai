/**
 * Tipos de evento de la línea de tiempo del cliente. Se separan a
 * propósito en dos grupos:
 *
 * - Determinísticos (se registran en código, sin IA, siempre exactos):
 *   consulta recibida (al crear el cliente) y venta cerrada/perdida
 *   (al cambiar el estado a Ganado/Perdido).
 * - Detectados por IA (requieren leer la conversación): cotización
 *   enviada, objeción detectada, seguimiento realizado, cliente
 *   respondió. Estos no se pueden inferir de forma confiable sin leer
 *   el texto, así que los evalúa el módulo `lib/ai/timeline.ts`.
 */
export const EVENT_TYPES = [
  { key: "inquiry_received", label: "Consulta recibida", color: "#6366F1" },
  { key: "quote_sent", label: "Cotización enviada", color: "#0EA5E9" },
  { key: "objection_detected", label: "Objeción detectada", color: "#F59E0B" },
  { key: "follow_up_done", label: "Seguimiento realizado", color: "#8B5CF6" },
  { key: "client_replied", label: "Cliente respondió", color: "#22C55E" },
  { key: "sale_won", label: "Venta cerrada", color: "#16A34A" },
  { key: "sale_lost", label: "Venta perdida", color: "#EF4444" },
] as const;

export type EventTypeKey = (typeof EVENT_TYPES)[number]["key"];

export const AI_DETECTABLE_EVENT_KEYS: EventTypeKey[] = [
  "quote_sent",
  "objection_detected",
  "follow_up_done",
  "client_replied",
];

export function getEventMeta(key: string): { key: string; label: string; color: string } {
  return EVENT_TYPES.find((e) => e.key === key) ?? { key, label: key, color: "#6B7280" };
}
