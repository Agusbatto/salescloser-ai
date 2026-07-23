import { z } from "zod";

/** Parsea un array de strings mandado como JSON desde un campo oculto del formulario. */
function parseJsonStringArray(val: string | null | undefined): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string" && v.trim().length > 0) : [];
  } catch {
    return [];
  }
}

/** Parsea un array de números (edades) mandado como JSON. */
function parseJsonNumberArray(val: string | null | undefined): number[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed.filter((v): v is number => typeof v === "number" && !Number.isNaN(v)) : [];
  } catch {
    return [];
  }
}

interface RawRoom {
  adults?: unknown;
  minorsAges?: unknown;
}

/** Parsea la configuración de habitaciones mandada como JSON. */
function parseJsonRooms(val: string | null | undefined): { adults: number; minorsAges: number[] }[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((r): r is RawRoom => !!r && typeof r === "object")
      .map((r) => ({
        adults: typeof r.adults === "number" && !Number.isNaN(r.adults) ? r.adults : 0,
        minorsAges: Array.isArray(r.minorsAges)
          ? r.minorsAges.filter((a): a is number => typeof a === "number" && !Number.isNaN(a))
          : [],
      }));
  } catch {
    return [];
  }
}

/**
 * Validación de entrada para crear/editar un cliente. Se usa tanto en
 * los Server Actions como en el formulario del cliente.
 *
 * Los campos de destinos/habitaciones/edades de menores llegan como
 * texto JSON (armados en el formulario, que los maneja como listas
 * dinámicas) — se parsean acá a los tipos reales.
 */
export const clientInputSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  leadOrigin: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),

  // Ficha del viaje — campos manuales nuevos.
  dateFlexibility: z.string().trim().optional().nullable(),
  passengerRelationship: z.string().trim().optional().nullable(),
  tripReason: z.string().trim().optional().nullable(),
  additionalInfo: z.string().trim().optional().nullable(),
  adultsCount: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return null;
      const n = Number.parseInt(val, 10);
      return Number.isNaN(n) ? null : n;
    }),
  combinedDestinationsJson: z
    .string()
    .optional()
    .nullable()
    .transform(parseJsonStringArray)
    .transform((arr) => arr as string[]),
  alternativeDestinationsJson: z
    .string()
    .optional()
    .nullable()
    .transform(parseJsonStringArray)
    .transform((arr) => arr as string[]),
  minorsAgesJson: z
    .string()
    .optional()
    .nullable()
    .transform(parseJsonNumberArray)
    .transform((arr) => arr as number[]),
  roomsJson: z
    .string()
    .optional()
    .nullable()
    .transform(parseJsonRooms),
});

export type ClientInputRaw = z.infer<typeof clientInputSchema>;

/**
 * Forma final que usa el resto de la app: nombres sin el sufijo "Json".
 *
 * A propósito NO incluye company/phone/email/productInterest (se
 * sacaron del formulario), ni status/lastContactAt: el estado se
 * cambia con un control rápido aparte (`updateClientStatus`) y el
 * último contacto se actualiza solo cuando hay actividad en el chat
 * (`touchLastContact`) — no tiene sentido que el formulario los pise.
 */
export interface ClientInput {
  name: string;
  leadOrigin?: string | null;
  notes?: string | null;
  dateFlexibility?: string | null;
  passengerRelationship?: string | null;
  tripReason?: string | null;
  additionalInfo?: string | null;
  adultsCount?: number | null;
  combinedDestinations?: string[];
  alternativeDestinations?: string[];
  minorsAges?: number[];
  rooms?: { adults: number; minorsAges: number[] }[];
}

/** Adapta lo que devuelve el parseo de zod (con sufijo "Json") a la forma que usa el resto de la app. */
export function toClientInput(raw: ClientInputRaw): ClientInput {
  return {
    name: raw.name,
    leadOrigin: raw.leadOrigin,
    notes: raw.notes,
    dateFlexibility: raw.dateFlexibility,
    passengerRelationship: raw.passengerRelationship,
    tripReason: raw.tripReason,
    additionalInfo: raw.additionalInfo,
    adultsCount: raw.adultsCount,
    combinedDestinations: raw.combinedDestinationsJson,
    alternativeDestinations: raw.alternativeDestinationsJson,
    minorsAges: raw.minorsAgesJson,
    rooms: raw.roomsJson,
  };
}

export const tagInputSchema = z.object({
  name: z.string().trim().min(1, "El nombre de la etiqueta es obligatorio"),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color inválido"),
});

export type TagInput = z.infer<typeof tagInputSchema>;
