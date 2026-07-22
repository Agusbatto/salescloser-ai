import type { CoachAnalysis } from "@/types/coach";
import type { FollowUpSuggestion } from "@/types/follow-up";
import type { SalesIntelligence } from "@/types/sales-intelligence";
import type { PreContactStrategy } from "@/types/pre-contact";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

/** Una habitación: cuántos adultos y las edades de los menores que la comparten. */
export interface RoomConfig {
  adults: number;
  minorsAges: number[];
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
  lastContactAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];

  // Ficha del viaje — cargada a mano por el vendedor, no por IA.
  combinedDestinations: string[];
  alternativeDestinations: string[];
  dateFlexibility: string | null;
  adultsCount: number | null;
  minorsAges: number[];
  rooms: RoomConfig[];
  passengerRelationship: string | null;
  tripReason: string | null;
  additionalInfo: string | null;

  // Análisis de IA — se disparan a mano desde el chat del cliente.
  coachAnalysis: CoachAnalysis | null;
  coachAnalysisUpdatedAt: string | null;
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
