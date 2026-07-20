export interface LevelAssessment {
  level: string;
  note: string;
}

export interface SuggestedResponse {
  technique: string;
  message: string;
  rationale: string;
}

export interface CoachAnalysis {
  techniqueRationale: string | null;
  stage: string | null;
  temperature: string | null;
  purchaseProbability: string | null;
  interestLevel: LevelAssessment | null;
  objections: string[];
  churnRisk: LevelAssessment | null;
  urgency: LevelAssessment | null;
  nextAction: string | null;
  suggestedResponses: SuggestedResponse[];
}
