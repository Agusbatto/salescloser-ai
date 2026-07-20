import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Client, ClientFilters } from "@/types/client";
import type { ClientInput } from "@/lib/validations/client";
import type { TravelAnalysis } from "@/config/travel-analysis";
import type { CoachAnalysis } from "@/types/coach";
import type { LeadScore } from "@/types/lead-score";
import type { FollowUpSuggestion } from "@/types/follow-up";
import type { SalesIntelligence } from "@/types/sales-intelligence";
import type { PreContactStrategy } from "@/types/pre-contact";
import { getPriorityScore } from "@/config/coach";
import { isClosedStatus } from "@/config/crm";

/**
 * Toda la lógica de acceso a la tabla `clients` (+ sus tags) vive acá.
 * Componentes y Server Actions llaman a estas funciones, nunca a
 * Supabase directamente.
 */

// Fila cruda tal como viene de Supabase (snake_case + tags anidados).
interface ClientRow {
  id: string;
  owner_id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  product_interest: string | null;
  lead_origin: string | null;
  status: string;
  notes: string | null;
  conversation: string | null;
  last_contact_at: string | null;
  created_at: string;
  updated_at: string;
  travel_analysis: TravelAnalysis | null;
  analysis_updated_at: string | null;
  coach_analysis: CoachAnalysis | null;
  coach_analysis_updated_at: string | null;
  lead_score: LeadScore | null;
  lead_score_updated_at: string | null;
  follow_up: FollowUpSuggestion | null;
  follow_up_updated_at: string | null;
  sales_intelligence: SalesIntelligence | null;
  sales_intelligence_updated_at: string | null;
  pre_contact_strategy: PreContactStrategy | null;
  pre_contact_strategy_updated_at: string | null;
  client_tags: { tags: { id: string; name: string; color: string } | null }[];
}

function mapClient(row: ClientRow): Client {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    company: row.company,
    phone: row.phone,
    email: row.email,
    productInterest: row.product_interest,
    leadOrigin: row.lead_origin,
    status: row.status,
    notes: row.notes,
    conversation: row.conversation,
    lastContactAt: row.last_contact_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    travelAnalysis: row.travel_analysis,
    analysisUpdatedAt: row.analysis_updated_at,
    coachAnalysis: row.coach_analysis,
    coachAnalysisUpdatedAt: row.coach_analysis_updated_at,
    leadScore: row.lead_score,
    leadScoreUpdatedAt: row.lead_score_updated_at,
    followUp: row.follow_up,
    followUpUpdatedAt: row.follow_up_updated_at,
    salesIntelligence: row.sales_intelligence,
    salesIntelligenceUpdatedAt: row.sales_intelligence_updated_at,
    preContactStrategy: row.pre_contact_strategy,
    preContactStrategyUpdatedAt: row.pre_contact_strategy_updated_at,
    tags: (row.client_tags ?? [])
      .map((ct) => ct.tags)
      .filter((t): t is { id: string; name: string; color: string } => !!t),
  };
}

const CLIENT_SELECT = `
  id, owner_id, name, company, phone, email,
  product_interest, lead_origin, status, notes, conversation,
  last_contact_at, created_at, updated_at,
  travel_analysis, analysis_updated_at,
  coach_analysis, coach_analysis_updated_at,
  lead_score, lead_score_updated_at,
  follow_up, follow_up_updated_at,
  sales_intelligence, sales_intelligence_updated_at,
  pre_contact_strategy, pre_contact_strategy_updated_at,
  client_tags ( tags ( id, name, color ) )
`;

export async function listClients(filters: ClientFilters = {}): Promise<Client[]> {
  const supabase = await createClient();

  let query = supabase
    .from("clients")
    .select(CLIENT_SELECT)
    .order("created_at", { ascending: false });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.leadOrigin) {
    query = query.eq("lead_origin", filters.leadOrigin);
  }
  if (filters.search) {
    const term = filters.search.trim();
    if (term) {
      query = query.or(
        `name.ilike.%${term}%,company.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`,
      );
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(`No se pudieron obtener los clientes: ${error.message}`);

  let clients = (data as unknown as ClientRow[]).map(mapClient);

  // Filtro por tag: se aplica en memoria porque involucra la tabla puente.
  if (filters.tagId) {
    clients = clients.filter((c) => c.tags.some((t) => t.id === filters.tagId));
  }

  return clients;
}

export async function getClient(id: string): Promise<Client | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select(CLIENT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`No se pudo obtener el cliente: ${error.message}`);
  if (!data) return null;
  return mapClient(data as unknown as ClientRow);
}

function toDbPayload(input: ClientInput, ownerId?: string) {
  return {
    ...(ownerId ? { owner_id: ownerId } : {}),
    name: input.name,
    company: input.company || null,
    phone: input.phone || null,
    email: input.email || null,
    product_interest: input.productInterest || null,
    lead_origin: input.leadOrigin || null,
    status: input.status,
    notes: input.notes || null,
    conversation: input.conversation || null,
    last_contact_at: input.lastContactAt || null,
  };
}

export async function createClientRecord(input: ClientInput): Promise<Client> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("No hay usuario autenticado");

  const { data, error } = await supabase
    .from("clients")
    .insert(toDbPayload(input, userData.user.id))
    .select(CLIENT_SELECT)
    .single();

  if (error) throw new Error(`No se pudo crear el cliente: ${error.message}`);
  return mapClient(data as unknown as ClientRow);
}

export async function updateClientRecord(id: string, input: ClientInput): Promise<Client> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .update(toDbPayload(input))
    .eq("id", id)
    .select(CLIENT_SELECT)
    .single();

  if (error) throw new Error(`No se pudo actualizar el cliente: ${error.message}`);
  return mapClient(data as unknown as ClientRow);
}

export async function deleteClientRecord(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw new Error(`No se pudo eliminar el cliente: ${error.message}`);
}

export async function setClientTags(clientId: string, tagIds: string[]): Promise<void> {
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("client_tags")
    .delete()
    .eq("client_id", clientId);
  if (deleteError) throw new Error(`No se pudieron actualizar las etiquetas: ${deleteError.message}`);

  if (tagIds.length === 0) return;

  const { error: insertError } = await supabase
    .from("client_tags")
    .insert(tagIds.map((tagId) => ({ client_id: clientId, tag_id: tagId })));
  if (insertError) throw new Error(`No se pudieron asignar las etiquetas: ${insertError.message}`);
}

export async function updateClientAnalysis(id: string, analysis: TravelAnalysis): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({
      travel_analysis: analysis,
      analysis_updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(`No se pudo guardar el análisis: ${error.message}`);
}

export async function updateClientCoachAnalysis(id: string, analysis: CoachAnalysis): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({
      coach_analysis: analysis,
      coach_analysis_updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(`No se pudo guardar el análisis de venta: ${error.message}`);
}

export async function updateClientLeadScore(id: string, leadScore: LeadScore): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({
      lead_score: leadScore,
      lead_score_updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(`No se pudo guardar el puntaje del lead: ${error.message}`);
}

export async function updateClientFollowUp(id: string, followUp: FollowUpSuggestion): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({
      follow_up: followUp,
      follow_up_updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(`No se pudo guardar el seguimiento sugerido: ${error.message}`);
}

export async function updateClientSalesIntelligence(
  id: string,
  intelligence: SalesIntelligence,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({
      sales_intelligence: intelligence,
      sales_intelligence_updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(`No se pudo guardar Sales Intelligence: ${error.message}`);
}

export async function updateClientPreContactStrategy(
  id: string,
  strategy: PreContactStrategy,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({
      pre_contact_strategy: strategy,
      pre_contact_strategy_updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(`No se pudo guardar la estrategia previa al contacto: ${error.message}`);
}

export interface DashboardStats {
  total: number;
  byStatus: { status: string; count: number }[];
  priorityRanking: Client[];
}

export interface RankingFilters {
  status?: string;
  temperature?: string;
  tagId?: string;
  minProbability?: number;
  maxProbability?: number;
}

export async function getDashboardStats(filters: RankingFilters = {}): Promise<DashboardStats> {
  const clients = await listClients();

  const byStatusMap = new Map<string, number>();
  for (const c of clients) {
    byStatusMap.set(c.status, (byStatusMap.get(c.status) ?? 0) + 1);
  }

  let ranked = clients.filter((c) => !isClosedStatus(c.status));

  if (filters.status) {
    ranked = ranked.filter((c) => c.status === filters.status);
  }
  if (filters.temperature) {
    ranked = ranked.filter(
      (c) => c.coachAnalysis?.temperature?.toLowerCase() === filters.temperature?.toLowerCase(),
    );
  }
  if (filters.tagId) {
    ranked = ranked.filter((c) => c.tags.some((t) => t.id === filters.tagId));
  }
  if (typeof filters.minProbability === "number" && !Number.isNaN(filters.minProbability)) {
    ranked = ranked.filter((c) => getPriorityScore(c.coachAnalysis) >= filters.minProbability!);
  }
  if (typeof filters.maxProbability === "number" && !Number.isNaN(filters.maxProbability)) {
    ranked = ranked.filter((c) => getPriorityScore(c.coachAnalysis) <= filters.maxProbability!);
  }

  const priorityRanking = ranked.sort(
    (a, b) => getPriorityScore(b.coachAnalysis) - getPriorityScore(a.coachAnalysis),
  );

  return {
    total: clients.length,
    byStatus: Array.from(byStatusMap.entries()).map(([status, count]) => ({ status, count })),
    priorityRanking,
  };
}
