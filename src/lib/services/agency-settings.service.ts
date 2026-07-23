import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AgencyService {
  text: string;
  courtesy: boolean;
}

export interface AgencySettings {
  fullName: string | null;
  gender: string | null;
  agencyName: string | null;
  agencyLocation: string | null;
  agencyPhones: string | null;
  emergencyPhone: string | null;
  preferredTone: string | null;
  preferredCurrency: string | null;
  additionalServices: AgencyService[];
  paymentMethods: string | null;
}

const EMPTY_SETTINGS: AgencySettings = {
  fullName: null,
  gender: null,
  agencyName: null,
  agencyLocation: null,
  agencyPhones: null,
  emergencyPhone: null,
  preferredTone: null,
  preferredCurrency: null,
  additionalServices: [],
  paymentMethods: null,
};

interface RawService {
  text?: unknown;
  courtesy?: unknown;
}

function parseServices(raw: unknown): AgencyService[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s): s is RawService => !!s && typeof s === "object")
    .map((s) => ({
      text: typeof s.text === "string" ? s.text : "",
      courtesy: s.courtesy === true,
    }))
    .filter((s) => s.text.trim().length > 0);
}

export async function getAgencySettings(): Promise<AgencySettings> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return EMPTY_SETTINGS;

  const { data, error } = await supabase
    .from("agency_settings")
    .select(
      "full_name, gender, agency_name, agency_location, agency_phones, emergency_phone, preferred_tone, preferred_currency, additional_services_structured, payment_methods",
    )
    .eq("owner_id", userData.user.id)
    .maybeSingle();

  if (error) throw new Error(`No se pudo obtener la configuración: ${error.message}`);
  if (!data) return EMPTY_SETTINGS;

  return {
    fullName: data.full_name,
    gender: data.gender,
    agencyName: data.agency_name,
    agencyLocation: data.agency_location,
    agencyPhones: data.agency_phones,
    emergencyPhone: data.emergency_phone,
    preferredTone: data.preferred_tone,
    preferredCurrency: data.preferred_currency,
    additionalServices: parseServices(data.additional_services_structured),
    paymentMethods: data.payment_methods,
  };
}

export async function upsertAgencySettings(settings: AgencySettings): Promise<void> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("No hay usuario autenticado");

  const { error } = await supabase.from("agency_settings").upsert({
    owner_id: userData.user.id,
    full_name: settings.fullName,
    gender: settings.gender,
    agency_name: settings.agencyName,
    agency_location: settings.agencyLocation,
    agency_phones: settings.agencyPhones,
    emergency_phone: settings.emergencyPhone,
    preferred_tone: settings.preferredTone,
    preferred_currency: settings.preferredCurrency,
    additional_services_structured: settings.additionalServices,
    payment_methods: settings.paymentMethods,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(`No se pudo guardar la configuración: ${error.message}`);
}

/**
 * Arma el texto que se le inyecta a la IA en los módulos que redactan
 * mensajes (seguimiento, coach, chat del cliente, chat de captura) para
 * que firme con los datos correctos, ofrezca servicios/cortesías y
 * mencione las formas de pago cuando corresponda.
 */
export function buildAgencyContext(settings: AgencySettings): string {
  const servicesText =
    settings.additionalServices.length > 0
      ? settings.additionalServices
          .map((s) => `- ${s.text}${s.courtesy ? " (se puede ofrecer como cortesía, sin costo, si la situación lo amerita)" : ""}`)
          .join("\n")
      : null;

  const parts = [
    settings.fullName ? `Nombre del vendedor: ${settings.fullName}` : null,
    settings.gender
      ? `IMPORTANTE — género del vendedor: ${settings.gender}. Cuando redactes en primera persona (el vendedor hablando de sí mismo), conjugá TODOS los adjetivos y participios según este género — ej. si es "Masculino": "quedo atento", "encantado", "seguro"; si es "Femenino": "quedo atenta", "encantada", "segura". Es obligatorio, no una sugerencia.`
      : null,
    settings.agencyName ? `Nombre de la agencia: ${settings.agencyName}` : null,
    settings.agencyLocation ? `Ubicación de la agencia: ${settings.agencyLocation}` : null,
    settings.agencyPhones ? `Teléfono(s) de la agencia: ${settings.agencyPhones}` : null,
    settings.emergencyPhone ? `Teléfono de emergencia: ${settings.emergencyPhone}` : null,
    settings.preferredTone ? `Tono de comunicación preferido: ${settings.preferredTone}` : null,
    settings.preferredCurrency ? `Moneda habitual para cotizar: ${settings.preferredCurrency}` : null,
    settings.paymentMethods
      ? `Formas de pago disponibles (mencionalas cuando el cliente pregunte cómo pagar, o al cerrar):\n${settings.paymentMethods}`
      : null,
    servicesText
      ? `Servicios adicionales que se pueden ofrecer para cerrar la venta (ofrecelos solo cuando tenga sentido en el momento de la conversación):\n${servicesText}`
      : null,
  ].filter((p): p is string => !!p);

  return parts.join("\n");
}
