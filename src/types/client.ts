import type { TravelAnalysis } from "@/config/travel-analysis";
import type { CoachAnalysis } from "@/types/coach";
import type { LeadScore } from "@/types/lead-score";
import type { FollowUpSuggestion } from "@/types/follow-up";
import type { SalesIntelligence } from "@/types/sales-intelligence";
import type { PreContactStrategy } from "@/types/pre-contact";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Client {
  id: string;
  ownerId: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  productInterest: string | null;
  leadOrigin: string | null;
  status: string;
  notes: string | null;
  conversation: string | null;
  lastContactAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  travelAnalysis: TravelAnalysis | null;
  analysisUpdatedAt: string | null;
  coachAnalysis: CoachAnalysis | null;
  coachAnalysisUpdatedAt: string | null;
  leadScore: LeadScore | null;
  leadScoreUpdatedAt: string | null;
  followUp: FollowUpSuggestion | null;
  followUpUpdatedAt: string | null;
  salesIntelligence: SalesIntelligence | null;
  salesIntelligenceUpdatedAt: string | null;
  preContactStrategy: PreContactStrategy | null;
  preContactStrategyUpdatedAt: string | null;
}

export interface ClientFilters {
  search?: string;
  status?: string;
  leadOrigin?: string;
  tagId?: string;
}
