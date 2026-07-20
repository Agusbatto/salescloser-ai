import "server-only";
import { getAIClient, AI_MODEL } from "@/lib/ai/client";
import { FOLLOW_UP_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import type { FollowUpStatus } from "@/config/follow-up";
import type { FollowUpSuggestion } from "@/types/follow-up";

function emptyFollowUpSuggestion(): FollowUpSuggestion {
  return { recommendedTiming: null, message: null, rationale: null };
}

/**
 * Genera el seguimiento ideal: cuándo retomar el contacto, el mensaje
 * (nunca repite lo ya dicho en la conversación) y por qué ese momento y
 * ese mensaje aumentan la probabilidad de cierre.
 */
export async function generateFollowUp(
  conversation: string,
  status: FollowUpStatus,
): Promise<FollowUpSuggestion> {
  const trimmed = conversation.trim();
  if (!trimmed) {
    return emptyFollowUpSuggestion();
  }

  const userMessage = `Días desde el último contacto: ${status.daysSinceLastContact ?? "sin datos"}
Umbral considerado "demasiado tiempo" para este cliente: ${status.thresholdDays} días
¿Ya está atrasado?: ${status.isOverdue ? "Sí" : "No, todavía no"}

Conversación completa (no repitas nada de lo que ya se dijo acá):
${trimmed}`;

  const anthropic = getAIClient();

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 1024,
    system: FOLLOW_UP_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
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
    throw new Error("No se pudo interpretar la sugerencia de la IA como JSON.");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("La respuesta de la IA no tiene el formato esperado.");
  }

  const raw = parsed as Record<string, unknown>;

  return {
    recommendedTiming:
      typeof raw.recommended_timing === "string" ? raw.recommended_timing.trim() : null,
    message: typeof raw.message === "string" ? raw.message.trim() : null,
    rationale: typeof raw.rationale === "string" ? raw.rationale.trim() : null,
  };
}
