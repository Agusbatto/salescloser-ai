"use server";

import { revalidatePath } from "next/cache";
import { upsertAgencySettings, type AgencySettings } from "@/lib/services/agency-settings.service";

export interface SettingsActionResult {
  success: boolean;
  error?: string;
}

export async function saveAgencySettingsAction(
  _prev: SettingsActionResult | null,
  formData: FormData,
): Promise<SettingsActionResult> {
  const servicesJson = formData.get("additionalServicesJson") as string | null;
  let additionalServices: string | null = null;
  if (servicesJson) {
    try {
      const blocks = JSON.parse(servicesJson);
      if (Array.isArray(blocks)) {
        const cleaned = blocks
          .filter((b): b is string => typeof b === "string" && b.trim().length > 0)
          .map((b) => b.trim());
        additionalServices = cleaned.length > 0 ? cleaned.join("\n") : null;
      }
    } catch {
      additionalServices = null;
    }
  }

  const settings: AgencySettings = {
    fullName: (formData.get("fullName") as string)?.trim() || null,
    gender: (formData.get("gender") as string)?.trim() || null,
    agencyName: (formData.get("agencyName") as string)?.trim() || null,
    agencyLocation: (formData.get("agencyLocation") as string)?.trim() || null,
    agencyPhones: (formData.get("agencyPhones") as string)?.trim() || null,
    emergencyPhone: (formData.get("emergencyPhone") as string)?.trim() || null,
    preferredTone: (formData.get("preferredTone") as string)?.trim() || null,
    preferredCurrency: (formData.get("preferredCurrency") as string)?.trim() || null,
    additionalServices,
  };

  try {
    await upsertAgencySettings(settings);
    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}
