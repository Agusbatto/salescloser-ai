import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ClientEvent, DetectedEvent } from "@/types/timeline";

interface ClientEventRow {
  id: string;
  event_type: string;
  description: string | null;
  occurred_at: string;
}

function mapEvent(row: ClientEventRow): ClientEvent {
  return { id: row.id, type: row.event_type, description: row.description, occurredAt: row.occurred_at };
}

export async function listClientEvents(clientId: string): Promise<ClientEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_events")
    .select("id, event_type, description, occurred_at")
    .eq("client_id", clientId)
    .order("occurred_at", { ascending: false });

  if (error) throw new Error(`No se pudo obtener la línea de tiempo: ${error.message}`);
  return (data as ClientEventRow[]).map(mapEvent);
}

export async function logClientEvent(
  clientId: string,
  eventType: string,
  description?: string | null,
): Promise<void> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("No hay usuario autenticado");

  const { error } = await supabase.from("client_events").insert({
    client_id: clientId,
    owner_id: userData.user.id,
    event_type: eventType,
    description: description ?? null,
  });

  if (error) throw new Error(`No se pudo registrar el evento: ${error.message}`);
}

/** Inserta en lote los eventos que la IA detectó al leer la conversación. */
export async function logDetectedEvents(clientId: string, events: DetectedEvent[]): Promise<void> {
  if (events.length === 0) return;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("No hay usuario autenticado");

  const rows = events.map((event) => ({
    client_id: clientId,
    owner_id: userData.user!.id,
    event_type: event.type,
    description: event.description,
  }));

  const { error } = await supabase.from("client_events").insert(rows);
  if (error) throw new Error(`No se pudieron registrar los eventos detectados: ${error.message}`);
}
