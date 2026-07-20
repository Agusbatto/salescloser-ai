export interface LeadScoreFactor {
  key: string;
  impact: "positive" | "negative" | "neutral";
  note: string;
}

export interface LeadScore {
  score: number | null;
  summary: string | null;
  factors: LeadScoreFactor[];
}

export interface ConversationMetrics {
  messageCount: number;
  questionCount: number;
  daysSinceLastContact: number | null;
}
