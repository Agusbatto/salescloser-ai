import "server-only";
import { getAIClient, AI_MODEL } from "@/lib/ai/client";
import { TIMELINE_EVENTS_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { AI_DETECTABLE_EVENT_KEYS } from "@/config/timeline";
import type { DetectedEvent } from "@/types/timeline";

const MAX_EVENTS = 8;

/**
 * Lee la conversación y detecta cuáles de los 4 hitos "cualitativos"
 * ocurrieron (cotización enviada, objeción detectada, seguimiento
 * realizado, cliente respondió). Los otros 3 tipos de evento (consulta
 * recibida, venta cerrada, venta perdida) NO pasan por acá — se
 * registran directamente en código, porque son 100% determinísticos.
 */
export async function detectTimelineEvents(conversationText: string): Promise<DetectedEvent[]> {
  const trimmed = conversationText.trim();
  if (!trimmed) return [];

  const anthropic = getAIClient();

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 1024,
    system: TIMELINE_EVENTS_SYSTEM_PROMPT,
    messages: [{ role: "user", content: trimmed }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("La IA no devolvió una respuesta de texto legible.");
  }

  const cleaned = textBlock.text.replace(/```json/gi, "").replace(/```/g, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("No se pudieron interpretar los eventos detectados como JSON.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("La respuesta de la IA no tiene el formato esperado.");
  }

  const events: DetectedEvent[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const type = typeof obj.type === "string" ? obj.type.trim() : "";
    const description = typeof obj.description === "string" ? obj.description.trim() : "";
    if (!description || !AI_DETECTABLE_EVENT_KEYS.includes(type as (typeof AI_DETECTABLE_EVENT_KEYS)[number])) {
      continue;
    }
    events.push({ type, description });
    if (events.length >= MAX_EVENTS) break;
  }

  return events;
}
