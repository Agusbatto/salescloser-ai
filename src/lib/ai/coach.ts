import "server-only";
import { getAIClient, AI_MODEL } from "@/lib/ai/client";
import { SALES_COACH_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import type { CoachAnalysis, LevelAssessment, SuggestedResponse } from "@/types/coach";

function emptyCoachAnalysis(): CoachAnalysis {
  return {
    techniqueRationale: null,
    stage: null,
    temperature: null,
    purchaseProbability: null,
    interestLevel: null,
    objections: [],
    churnRisk: null,
    urgency: null,
    nextAction: null,
    suggestedResponses: [],
  };
}

function parseLevelAssessment(raw: unknown): LevelAssessment | null {
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const level = typeof obj.level === "string" ? obj.level.trim() : "";
    const note = typeof obj.note === "string" ? obj.note.trim() : "";
    if (!level && !note) return null;
    return { level: level || "—", note };
  }
  if (typeof raw === "string" && raw.trim()) {
    return { level: raw.trim(), note: "" };
  }
  return null;
}

function parseSuggestedResponses(raw: unknown): SuggestedResponse[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => ({
      technique: typeof item.technique === "string" ? item.technique.trim() : "",
      message: typeof item.message === "string" ? item.message.trim() : "",
      rationale: typeof item.rationale === "string" ? item.rationale.trim() : "",
    }))
    .filter((item) => item.message.length > 0)
    .slice(0, 3);
}

/**
 * Analiza una conversación de venta con un coach de IA que combina SPIN,
 * AIDA, BANT, Challenger, Sandler, Chris Voss, Belfort, Cardone, Tracy y
 * Cialdini. Devuelve un diagnóstico táctico, nunca una respuesta genérica.
 */
export async function analyzeSalesCoach(conversationText: string): Promise<CoachAnalysis> {
  const trimmed = conversationText.trim();
  if (!trimmed) {
    return emptyCoachAnalysis();
  }

  const anthropic = getAIClient();

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 2048,
    system: SALES_COACH_SYSTEM_PROMPT,
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
    throw new Error("No se pudo interpretar el análisis de la IA como JSON.");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("La respuesta de la IA no tiene el formato esperado.");
  }

  const raw = parsed as Record<string, unknown>;

  return {
    techniqueRationale:
      typeof raw.technique_rationale === "string" ? raw.technique_rationale.trim() : null,
    stage: typeof raw.stage === "string" ? raw.stage.trim() : null,
    temperature: typeof raw.temperature === "string" ? raw.temperature.trim() : null,
    purchaseProbability:
      typeof raw.purchase_probability === "string" ? raw.purchase_probability.trim() : null,
    interestLevel: parseLevelAssessment(raw.interest_level),
    objections: Array.isArray(raw.objections)
      ? raw.objections.filter((o): o is string => typeof o === "string" && o.trim().length > 0)
      : [],
    churnRisk: parseLevelAssessment(raw.churn_risk),
    urgency: parseLevelAssessment(raw.urgency),
    nextAction: typeof raw.next_action === "string" ? raw.next_action.trim() : null,
    suggestedResponses: parseSuggestedResponses(raw.suggested_responses),
  };
}
