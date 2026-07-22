"use server";

import { chatAboutScreenshot } from "@/lib/ai/screenshot-coach";
import { getAgencySettings, buildAgencyContext } from "@/lib/services/agency-settings.service";
import type { ChatTurn } from "@/lib/ai/client";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  imageDataUrl?: string;
}

/**
 * Recibe el historial completo de la conversación (armado en el
 * cliente) y devuelve la respuesta de la IA para el turno más reciente.
 * No se persiste en ningún lado — es una herramienta rápida, no ligada
 * a un cliente puntual del CRM.
 */
export async function sendScreenshotMessage(history: ChatMessage[]): Promise<string> {
  const turns: ChatTurn[] = history.map((m) => ({
    role: m.role,
    text: m.text,
    imageDataUrl: m.imageDataUrl,
  }));

  let agencyContext = "";
  try {
    agencyContext = buildAgencyContext(await getAgencySettings());
  } catch (err) {
    console.error("No se pudo cargar la configuración de agencia:", err);
  }

  return chatAboutScreenshot(turns, agencyContext);
}
