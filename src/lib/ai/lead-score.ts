import "server-only";
import { callAI } from "@/lib/ai/client";
import { LEAD_SCORE_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { computeConversationMetrics } from "@/lib/utils/conversation-metrics";
import { SCORE_FACTORS } from "@/config/lead-score";
import type { LeadScore, LeadScoreFactor } from "@/types/lead-score";

function emptyLeadScore(): LeadScore {
  return { score: null, summary: null, factors: [] };
}

function parseImpact(value: unknown): LeadScoreFactor["impact"] {
  if (value === "positive" || value === "negative" || value === "neutral") return value;
  return "neutral";
}

/**
 * Calcula el puntaje 0-100 de un lead. Las métricas objetivas (cantidad
 * de mensajes, preguntas, días desde el último contacto) se calculan en
 * código y se le pasan a la IA como contexto; el resto de los factores
 * (interés, presupuesto, objeciones, emociones, etc.) los evalúa la IA
 * leyendo la conversación.
 */
export async function calculateLeadScore(
  conversation: string,
  lastContactAt: string | null,
): Promise<LeadScore> {
  const trimmed = conversation.trim();
  if (!trimmed) {
    return emptyLeadScore();
  }

  const metrics = computeConversationMetrics(trimmed, lastContactAt);

  const userMessage = `Métricas calculadas en código (usalas tal cual para esos factores):
- Cantidad de mensajes (aprox.): ${metrics.messageCount}
- Cantidad de preguntas: ${metrics.questionCount}
- Días desde el último contacto: ${metrics.daysSinceLastContact ?? "sin datos"}

Conversación:
${trimmed}`;

  const rawText = await callAI(LEAD_SCORE_SYSTEM_PROMPT, userMessage, 1536);
  const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("No se pudo interpretar el puntaje de la IA como JSON.");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("La respuesta de la IA no tiene el formato esperado.");
  }

  const raw = parsed as Record<string, unknown>;

  const scoreNumber = typeof raw.score === "number" ? raw.score : Number(raw.score);
  const score = Number.isFinite(scoreNumber) ? Math.max(0, Math.min(100, Math.round(scoreNumber))) : null;

  const rawFactors = Array.isArray(raw.factors) ? raw.factors : [];
  const factorsByKey = new Map<string, Record<string, unknown>>();
  for (const item of rawFactors) {
    if (item && typeof item === "object" && typeof (item as Record<string, unknown>).factor === "string") {
      factorsByKey.set((item as Record<string, unknown>).factor as string, item as Record<string, unknown>);
    }
  }

  const factors: LeadScoreFactor[] = SCORE_FACTORS.map((field) => {
    const raw = factorsByKey.get(field.key);
    return {
      key: field.key,
      impact: parseImpact(raw?.impact),
      note: typeof raw?.note === "string" ? raw.note.trim() : "",
    };
  });

  return {
    score,
    summary: typeof raw.summary === "string" ? raw.summary.trim() : null,
    factors,
  };
}
