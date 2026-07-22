import type { Client } from "@/types/client";

export interface TripChecklistItem {
  key: string;
  label: string;
  present: boolean;
}

/**
 * A diferencia del checklist viejo (que dependía de que la IA leyera
 * una conversación), este se calcula directo de los campos que el
 * vendedor ya cargó a mano en el formulario — determinístico, sin
 * costo de IA.
 */
export function computeTripChecklist(client: Client): TripChecklistItem[] {
  return [
    { key: "destino", label: "Destino", present: client.combinedDestinations.length > 0 },
    { key: "pasajeros", label: "Pasajeros", present: !!client.adultsCount && client.adultsCount > 0 },
    { key: "habitaciones", label: "Habitaciones", present: client.rooms.length > 0 },
    {
      key: "fechas",
      label: "Flexibilidad de fechas",
      present: !!client.dateFlexibility?.trim(),
    },
    {
      key: "vinculo",
      label: "Vínculo entre pasajeros",
      present: !!client.passengerRelationship?.trim(),
    },
    { key: "motivo", label: "Motivo del viaje", present: !!client.tripReason?.trim() },
  ];
}
