import "server-only";
import { callAI } from "@/lib/ai/client";
import { SALES_COACH_INTELLIGENCE_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { parseLevelAssessment, parseStringArray, clampToLines } from "@/lib/ai/parse-helpers";
import type { CoachAnalysis, SuggestedResponse } from "@/types/coach";
import type { SalesIntelligence } from "@/types/sales-intelligence";

const EXECUTIVE_SUMMARY_MAX_LINES = 6;

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

function emptySalesIntelligence(): SalesIntelligence {
  return {
    stage: null,
    temperature: null,
    closingProbability: null,
    churnRisk: null,
    clientConfidence: null,
    urgency: null,
    budgetDetected: null,
    objections: [],
    purchaseIntent: null,
    emotions: [],
    nextAction: null,
    bestTechnique: null,
    pendingQuestions: [],
    missingTravelInfo: [],
    executiveSummary: null,
  };
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

export interface CoachAndIntelligenceResult {
  coach: CoachAnalysis;
  intelligence: SalesIntelligence;
}

/**
 * Antes eran dos llamadas separadas a la IA (`analyzeSalesCoach` +
 * `analyzeSalesIntelligence`) que calculaban, cada una por su cuenta,
 * varios de los mismos campos (etapa, temperatura, probabilidad,
 * objeciones, riesgo de abandono, urgencia, próxima acción). Ahora es
 * UNA sola llamada: el modelo calcula esos campos compartidos una vez,
 * y acá se arman los dos objetos (para las dos cards que ya existían,
 * sin cambios visibles para el usuario) a partir de esa única
 * respuesta. Recorta el gasto de esta parte del análisis a la mitad.
 */
export async function analyzeCoachAndIntelligence(
  conversationText: string,
  agencyContext?: string,
): Promise<CoachAndIntelligenceResult> {
  const trimmed = conversationText.trim();
  if (!trimmed) {
    return { coach: emptyCoachAnalysis(), intelligence: emptySalesIntelligence() };
  }

  const userMessage = agencyContext
    ? `Datos de la agencia (usalos para firmar los mensajes sugeridos y ofrecer servicios adicionales si corresponde en este momento):\n${agencyContext}\n\nConversación:\n${trimmed}`
    : trimmed;

  const rawText = await callAI(SALES_COACH_INTELLIGENCE_SYSTEM_PROMPT, userMessage, 2048);
  const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

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

  // Campos compartidos: se leen una sola vez y se reutilizan en los dos objetos.
  const stage = typeof raw.stage === "string" ? raw.stage.trim() : null;
  const temperature = typeof raw.temperature === "string" ? raw.temperature.trim() : null;
  const probability = typeof raw.probability === "string" ? raw.probability.trim() : null;
  const objections = parseStringArray(raw.objections);
  const churnRisk = parseLevelAssessment(raw.churn_risk);
  const urgency = parseLevelAssessment(raw.urgency);
  const nextAction = typeof raw.next_action === "string" ? raw.next_action.trim() : null;

  const coach: CoachAnalysis = {
    techniqueRationale:
      typeof raw.technique_rationale === "string" ? raw.technique_rationale.trim() : null,
    stage,
    temperature,
    purchaseProbability: probability,
    interestLevel: parseLevelAssessment(raw.interest_level),
    objections,
    churnRisk,
    urgency,
    nextAction,
    suggestedResponses: parseSuggestedResponses(raw.suggested_responses),
  };

  const intelligence: SalesIntelligence = {
    stage,
    temperature,
    closingProbability: probability,
    churnRisk,
    clientConfidence: parseLevelAssessment(raw.client_confidence),
    urgency,
    budgetDetected: typeof raw.budget_detected === "string" ? raw.budget_detected.trim() : null,
    objections,
    purchaseIntent: parseLevelAssessment(raw.purchase_intent),
    emotions: parseStringArray(raw.emotions),
    nextAction,
    bestTechnique: typeof raw.best_technique === "string" ? raw.best_technique.trim() : null,
    pendingQuestions: parseStringArray(raw.pending_questions),
    missingTravelInfo: parseStringArray(raw.missing_travel_info),
    executiveSummary: clampToLines(raw.executive_summary, EXECUTIVE_SUMMARY_MAX_LINES),
  };

  return { coach, intelligence };
}
