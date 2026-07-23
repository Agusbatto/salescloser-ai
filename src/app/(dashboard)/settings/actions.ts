"use server";

import { revalidatePath } from "next/cache";
import {
  upsertAgencySettings,
  type AgencySettings,
  type AgencyService,
} from "@/lib/services/agency-settings.service";

export interface SettingsActionResult {
  success: boolean;
  error?: string;
}

function parseServicesJson(raw: string | null): AgencyService[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((s): s is { text?: unknown; courtesy?: unknown } => !!s && typeof s === "object")
      .map((s) => ({
        text: typeof s.text === "string" ? s.text.trim() : "",
        courtesy: s.courtesy === true,
      }))
      .filter((s) => s.text.length > 0);
  } catch {
    return [];
  }
}

export async function saveAgencySettingsAction(
  _prev: SettingsActionResult | null,
  formData: FormData,
): Promise<SettingsActionResult> {
  const settings: AgencySettings = {
    fullName: (formData.get("fullName") as string)?.trim() || null,
    gender: (formData.get("gender") as string)?.trim() || null,
    agencyName: (formData.get("agencyName") as string)?.trim() || null,
    agencyLocation: (formData.get("agencyLocation") as string)?.trim() || null,
    agencyPhones: (formData.get("agencyPhones") as string)?.trim() || null,
    emergencyPhone: (formData.get("emergencyPhone") as string)?.trim() || null,
    preferredTone: (formData.get("preferredTone") as string)?.trim() || null,
    preferredCurrency: (formData.get("preferredCurrency") as string)?.trim() || null,
    paymentMethods:
      (() => {
        const raw = formData.get("paymentMethodsJson") as string | null;
        if (!raw) return null;
        try {
          const blocks = JSON.parse(raw);
          if (!Array.isArray(blocks)) return null;
          const cleaned = blocks
            .filter((b): b is string => typeof b === "string" && b.trim().length > 0)
            .map((b) => b.trim());
          return cleaned.length > 0 ? cleaned.join("\n") : null;
        } catch {
          return null;
        }
      })(),
    additionalServices: parseServicesJson(formData.get("additionalServicesJson") as string | null),
  };

  try {
    await upsertAgencySettings(settings);
    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}
