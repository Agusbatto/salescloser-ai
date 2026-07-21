import "server-only";
import { callAI } from "@/lib/ai/client";
import { CONVERSATION_ANALYSIS_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { ANALYSIS_FIELDS, emptyAnalysis, type TravelAnalysis } from "@/config/travel-analysis";

/**
 * Analiza una conversación pegada manualmente y devuelve los campos de
 * `ANALYSIS_FIELDS` extraídos. Si un campo no se menciona en la
 * conversación, queda en null (nunca se inventa información).
 */
export async function analyzeConversation(conversationText: string): Promise<TravelAnalysis> {
  const trimmed = conversationText.trim();
  if (!trimmed) {
    return emptyAnalysis();
  }

  const rawText = await callAI(CONVERSATION_ANALYSIS_SYSTEM_PROMPT, trimmed, 1024);
  const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("No se pudo interpretar la respuesta de la IA como JSON.");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("La respuesta de la IA no tiene el formato esperado.");
  }

  const raw = parsed as Record<string, unknown>;
  const result = emptyAnalysis();

  for (const field of ANALYSIS_FIELDS) {
    const value = raw[field.key];
    result[field.key] = typeof value === "string" && value.trim() ? value.trim() : null;
  }

  return result;
}
