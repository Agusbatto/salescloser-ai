import "server-only";
import { callAIChat, type ChatTurn } from "@/lib/ai/client";
import { SCREENSHOT_COACH_SYSTEM_PROMPT } from "@/lib/ai/prompts";

/**
 * Conversación multi-turno sobre una captura de pantalla: el vendedor
 * manda la imagen y puede seguir pidiendo ajustes ("más corto", "otra
 * opción") sobre la misma. El historial completo se reenvía en cada
 * turno porque la API no tiene memoria propia entre llamadas.
 */
export async function chatAboutScreenshot(turns: ChatTurn[]): Promise<string> {
  if (turns.length === 0) {
    throw new Error("No hay ningún mensaje para analizar.");
  }

  const reply = await callAIChat(SCREENSHOT_COACH_SYSTEM_PROMPT, turns, 1024);
  return reply.trim();
}
