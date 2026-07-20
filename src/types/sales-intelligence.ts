import type { LevelAssessment } from "@/types/coach";

// Reexportado para que los consumidores de este módulo no dependan de
// `types/coach` directamente — son conceptualmente independientes aunque
// comparten la forma { level, note }.
export type { LevelAssessment };

/**
 * "Cerebro comercial" consolidado: se calcula con cada análisis de
 * conversación, igual que la ficha de viaje, el coach, el puntaje del
 * lead y el seguimiento — pero no reemplaza a ninguno de esos, es una
 * lectura ejecutiva de arriba de todo, pensada para verse antes de leer
 * el chat completo.
 */
export interface SalesIntelligence {
  stage: string | null;
  temperature: string | null;
  closingProbability: string | null;
  churnRisk: LevelAssessment | null;
  clientConfidence: LevelAssessment | null;
  urgency: LevelAssessment | null;
  budgetDetected: string | null;
  objections: string[];
  purchaseIntent: LevelAssessment | null;
  emotions: string[];
  nextAction: string | null;
  bestTechnique: string | null;
  pendingQuestions: string[];
  missingTravelInfo: string[];
  executiveSummary: string | null;
}
