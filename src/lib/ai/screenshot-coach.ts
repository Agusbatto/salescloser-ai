import "server-only";
import { callAIChat, compactHistoryIfNeeded, type ChatTurn } from "@/lib/ai/client";
import { SCREENSHOT_COACH_SYSTEM_PROMPT } from "@/lib/ai/prompts";

/**
 * Conversación multi-turno sobre una captura de pantalla: el vendedor
 * manda la imagen y puede seguir pidiendo ajustes ("más corto", "otra
 * opción") sobre la misma. El historial se reenvía en cada turno (la
 * API no tiene memoria propia) — si ya es largo, se compacta primero
 * para no seguir pagando el costo completo de toda la charla anterior
 * en cada mensaje nuevo (ver `compactHistoryIfNeeded`).
 */
export async function chatAboutScreenshot(turns: ChatTurn[], agencyContext?: string): Promise<string> {
  if (turns.length === 0) {
    throw new Error("No hay ningún mensaje para analizar.");
  }

  const systemPrompt = agencyContext
    ? `${SCREENSHOT_COACH_SYSTEM_PROMPT}\n\nDatos de la agencia (usalos para firmar mensajes y ofrecer servicios adicionales si corresponde):\n${agencyContext}`
    : SCREENSHOT_COACH_SYSTEM_PROMPT;

  const compactedTurns = await compactHistoryIfNeeded(turns);
  const reply = await callAIChat(systemPrompt, compactedTurns, 1024);
  return reply.trim();
}
