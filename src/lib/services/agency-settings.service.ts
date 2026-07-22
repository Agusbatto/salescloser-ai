import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AgencySettings {
  fullName: string | null;
  gender: string | null;
  agencyName: string | null;
  agencyLocation: string | null;
  agencyPhones: string | null;
  emergencyPhone: string | null;
  additionalServices: string | null;
  preferredTone: string | null;
  preferredCurrency: string | null;
}

const EMPTY_SETTINGS: AgencySettings = {
  fullName: null,
  gender: null,
  agencyName: null,
  agencyLocation: null,
  agencyPhones: null,
  emergencyPhone: null,
  additionalServices: null,
  preferredTone: null,
  preferredCurrency: null,
};

export async function getAgencySettings(): Promise<AgencySettings> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return EMPTY_SETTINGS;

  const { data, error } = await supabase
    .from("agency_settings")
    .select(
      "full_name, gender, agency_name, agency_location, agency_phones, emergency_phone, additional_services, preferred_tone, preferred_currency",
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
    additionalServices: data.additional_services,
    preferredTone: data.preferred_tone,
    preferredCurrency: data.preferred_currency,
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
    additional_services: settings.additionalServices,
    preferred_tone: settings.preferredTone,
    preferred_currency: settings.preferredCurrency,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(`No se pudo guardar la configuración: ${error.message}`);
}

/**
 * Arma el texto que se le inyecta a la IA en los módulos que redactan
 * mensajes (seguimiento, coach, chat del cliente) para que firme con
 * los datos correctos y pueda ofrecer servicios adicionales al cerrar.
 * Devuelve string vacío si el usuario todavía no cargó nada — los
 * prompts ya están armados para funcionar igual sin este bloque.
 */
export function buildAgencyContext(settings: AgencySettings): string {
  const parts = [
    settings.fullName ? `Nombre del vendedor: ${settings.fullName}` : null,
    settings.gender ? `Género del vendedor (para conjugar bien si hace falta): ${settings.gender}` : null,
    settings.agencyName ? `Nombre de la agencia: ${settings.agencyName}` : null,
    settings.agencyLocation ? `Ubicación de la agencia: ${settings.agencyLocation}` : null,
    settings.agencyPhones ? `Teléfono(s) de la agencia: ${settings.agencyPhones}` : null,
    settings.emergencyPhone ? `Teléfono de emergencia: ${settings.emergencyPhone}` : null,
    settings.preferredTone ? `Tono de comunicación preferido: ${settings.preferredTone}` : null,
    settings.preferredCurrency ? `Moneda habitual para cotizar: ${settings.preferredCurrency}` : null,
    settings.additionalServices
      ? `Servicios adicionales que se pueden ofrecer para cerrar la venta (con costo, ofrecelos solo cuando tenga sentido en el momento de la conversación):\n${settings.additionalServices}`
      : null,
  ].filter((p): p is string => !!p);

  return parts.join("\n");
}
