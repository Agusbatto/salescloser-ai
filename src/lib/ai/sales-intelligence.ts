import "server-only";
import { callAI } from "@/lib/ai/client";
import { SALES_INTELLIGENCE_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import type { SalesIntelligence, LevelAssessment } from "@/types/sales-intelligence";

const MAX_SUMMARY_LINES = 6;

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

function parseStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

/** Recorta el resumen ejecutivo a máximo 6 líneas, por las dudas de que la IA no respete el límite. */
function clampSummary(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return lines.slice(0, MAX_SUMMARY_LINES).join("\n");
}

/**
 * Módulo "Sales Intelligence": el cerebro comercial consolidado. Se
 * ejecuta cada vez que se analiza una conversación, en paralelo con el
 * resto de los análisis existentes (ficha de viaje, coach, lead score,
 * seguimiento) — no los reemplaza, es una lectura ejecutiva adicional.
 */
export async function analyzeSalesIntelligence(conversationText: string): Promise<SalesIntelligence> {
  const trimmed = conversationText.trim();
  if (!trimmed) {
    return emptySalesIntelligence();
  }

  const rawText = await callAI(SALES_INTELLIGENCE_SYSTEM_PROMPT, trimmed, 2048);
  const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("No se pudo interpretar el análisis de Sales Intelligence como JSON.");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("La respuesta de la IA no tiene el formato esperado.");
  }

  const raw = parsed as Record<string, unknown>;

  return {
    stage: typeof raw.stage === "string" ? raw.stage.trim() : null,
    temperature: typeof raw.temperature === "string" ? raw.temperature.trim() : null,
    closingProbability:
      typeof raw.closing_probability === "string" ? raw.closing_probability.trim() : null,
    churnRisk: parseLevelAssessment(raw.churn_risk),
    clientConfidence: parseLevelAssessment(raw.client_confidence),
    urgency: parseLevelAssessment(raw.urgency),
    budgetDetected: typeof raw.budget_detected === "string" ? raw.budget_detected.trim() : null,
    objections: parseStringArray(raw.objections),
    purchaseIntent: parseLevelAssessment(raw.purchase_intent),
    emotions: parseStringArray(raw.emotions),
    nextAction: typeof raw.next_action === "string" ? raw.next_action.trim() : null,
    bestTechnique: typeof raw.best_technique === "string" ? raw.best_technique.trim() : null,
    pendingQuestions: parseStringArray(raw.pending_questions),
    missingTravelInfo: parseStringArray(raw.missing_travel_info),
    executiveSummary: clampSummary(raw.executive_summary),
  };
}
