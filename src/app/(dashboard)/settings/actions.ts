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
  const settings: AgencySettings = {
    fullName: (formData.get("fullName") as string)?.trim() || null,
    gender: (formData.get("gender") as string)?.trim() || null,
    agencyName: (formData.get("agencyName") as string)?.trim() || null,
    agencyLocation: (formData.get("agencyLocation") as string)?.trim() || null,
    agencyPhones: (formData.get("agencyPhones") as string)?.trim() || null,
    emergencyPhone: (formData.get("emergencyPhone") as string)?.trim() || null,
    additionalServices: (formData.get("additionalServices") as string)?.trim() || null,
  };

  try {
    await upsertAgencySettings(settings);
    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}
