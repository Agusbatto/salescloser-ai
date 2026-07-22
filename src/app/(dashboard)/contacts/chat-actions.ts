"use server";

import { revalidatePath } from "next/cache";
import { getClient, updateClientCoachAnalysis, updateClientFollowUp, updateClientSalesIntelligence } from "@/lib/services/contacts.service";
import {
  addClientChatMessage,
  clearClientChat,
  listClientChatMessages,
} from "@/lib/services/client-chat.service";
import { getAgencySettings, buildAgencyContext } from "@/lib/services/agency-settings.service";
import { replyInClientChat } from "@/lib/ai/client-chat";
import { analyzeCoachAndIntelligence } from "@/lib/ai/coach-intelligence";
import { generateFollowUp } from "@/lib/ai/follow-up";
import { summarizeConversation, type ChatTurn } from "@/lib/ai/client";
import { computeFollowUpStatus } from "@/config/follow-up";

export interface ClientChatResult {
  success: boolean;
  error?: string;
  reply?: string;
}

/**
 * Guarda el mensaje del vendedor (con imagen opcional), genera la
 * respuesta con el contexto actualizado del cliente + el historial ya
 * guardado, y guarda también esa respuesta. Devuelve el texto de la
 * respuesta para que el chat lo muestre en el momento, sin esperar a
 * un refetch completo.
 */
export async function sendClientChatMessageAction(
  clientId: string,
  message: string,
  imageDataUrl?: string | null,
): Promise<ClientChatResult> {
  const trimmed = message.trim();
  if (!trimmed && !imageDataUrl) {
    return { success: false, error: "Escribí un mensaje o adjuntá una imagen primero." };
  }

  try {
    const client = await getClient(clientId);
    if (!client) {
      return { success: false, error: "No se encontró el cliente." };
    }

    const history = await listClientChatMessages(clientId);

    let agencyContext = "";
    try {
      agencyContext = buildAgencyContext(await getAgencySettings());
    } catch (err) {
      console.error("No se pudo cargar la configuración de agencia:", err);
    }

    await addClientChatMessage(clientId, "user", trimmed, imageDataUrl);
    const reply = await replyInClientChat(client, history, trimmed, imageDataUrl, agencyContext);
    await addClientChatMessage(clientId, "assistant", reply);

    revalidatePath(`/contacts/${clientId}`);
    return { success: true, reply };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function clearClientChatAction(clientId: string): Promise<void> {
  await clearClientChat(clientId);
  revalidatePath(`/contacts/${clientId}`);
}

export interface AnalyzeChatResult {
  success: boolean;
  error?: string;
}

/**
 * Botón manual "Analizar conversación": arma el texto a analizar a
 * partir de todos los mensajes que el VENDEDOR escribió/pegó en el
 * chat (no las respuestas de la IA), y corre el diagnóstico de venta
 * (coach + Sales Intelligence, con el % de conversión) y el
 * seguimiento sugerido. A propósito NO es automático — así el gasto
 * de IA queda bajo control del vendedor, no atado a cada mensaje del
 * chat.
 */
export async function analyzeChatConversationAction(clientId: string): Promise<AnalyzeChatResult> {
  try {
    const client = await getClient(clientId);
    if (!client) {
      return { success: false, error: "No se encontró el cliente." };
    }

    const history = await listClientChatMessages(clientId);
    const conversationText = history
      .filter((m) => m.role === "user" && m.content.trim())
      .map((m) => m.content.trim())
      .join("\n\n");

    if (!conversationText.trim()) {
      return {
        success: false,
        error: "Todavía no hay nada para analizar — escribí o pegá algo en el chat primero.",
      };
    }

    let agencyContext = "";
    try {
      agencyContext = buildAgencyContext(await getAgencySettings());
    } catch (err) {
      console.error("No se pudo cargar la configuración de agencia:", err);
    }

    const followUpStatus = computeFollowUpStatus(
      client.lastContactAt,
      client.coachAnalysis?.temperature ?? null,
    );

    const [coachResult, followUpResult] = await Promise.allSettled([
      analyzeCoachAndIntelligence(conversationText, agencyContext).then(({ coach, intelligence }) =>
        Promise.all([
          updateClientCoachAnalysis(clientId, coach),
          updateClientSalesIntelligence(clientId, intelligence),
        ]),
      ),
      generateFollowUp(conversationText, followUpStatus, agencyContext).then((followUp) =>
        updateClientFollowUp(clientId, followUp),
      ),
    ]);

    if (coachResult.status === "rejected") {
      console.error("No se pudo generar el diagnóstico de venta:", coachResult.reason);
    }
    if (followUpResult.status === "rejected") {
      console.error("No se pudo generar el seguimiento sugerido:", followUpResult.reason);
    }

    revalidatePath(`/contacts/${clientId}`);

    if (coachResult.status === "rejected" && followUpResult.status === "rejected") {
      return { success: false, error: "No se pudo completar el análisis. Reintentá en unos minutos." };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export interface SummarizeChatResult {
  success: boolean;
  error?: string;
  summary?: string;
}

/**
 * Botón manual "Resumir": a diferencia de la compactación automática
 * (que solo achica lo que se le manda a la IA, nunca lo guardado), este
 * botón sí reemplaza el historial guardado por un resumen — es una
 * decisión explícita del vendedor para bajar el gasto de los próximos
 * mensajes, no algo que la app hace sola.
 */
export async function summarizeChatNowAction(clientId: string): Promise<SummarizeChatResult> {
  try {
    const history = await listClientChatMessages(clientId);
    if (history.length < 4) {
      return { success: false, error: "Todavía no hay suficiente conversación para resumir." };
    }

    const turns: ChatTurn[] = history.map((m) => ({
      role: m.role,
      text: m.content,
      imageDataUrl: m.imageDataUrl ?? undefined,
    }));

    const summary = await summarizeConversation(turns);
    const summaryMessage = `📋 Resumen de la conversación anterior:\n${summary}`;

    await clearClientChat(clientId);
    await addClientChatMessage(clientId, "assistant", summaryMessage);

    revalidatePath(`/contacts/${clientId}`);
    return { success: true, summary: summaryMessage };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}
