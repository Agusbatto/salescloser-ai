/**
 * Configuración editable del CRM. Cambiar estas listas no requiere
 * migraciones de base de datos (status/origin se guardan como texto).
 */
export const CLIENT_STATUSES = [
  { value: "nuevo", label: "Nuevo", color: "#6366F1" },
  { value: "contactado", label: "Contactado", color: "#0EA5E9" },
  { value: "en_negociacion", label: "En negociación", color: "#F59E0B" },
  { value: "ganado", label: "Ganado", color: "#22C55E" },
  { value: "perdido", label: "Perdido", color: "#EF4444" },
] as const;

export type ClientStatus = (typeof CLIENT_STATUSES)[number]["value"];

/** Estados que se consideran "cerrados": el cliente ya no está en pipeline activo. */
export const CLOSED_STATUSES: ClientStatus[] = ["ganado", "perdido"];

export function isClosedStatus(status: string): boolean {
  return CLOSED_STATUSES.includes(status as ClientStatus);
}

export const LEAD_ORIGINS = [
  "Sitio web",
  "Instagram",
  "Facebook",
  "Referido",
  "Llamada",
  "Otro",
] as const;

export type LeadOrigin = (typeof LEAD_ORIGINS)[number];

export function getStatusMeta(status: string) {
  return (
    CLIENT_STATUSES.find((s) => s.value === status) ?? {
      value: status,
      label: status,
      color: "#6B7280",
    }
  );
}
