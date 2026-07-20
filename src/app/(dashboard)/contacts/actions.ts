"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createClientRecord,
  deleteClientRecord,
  getClient,
  setClientTags,
  updateClientAnalysis,
  updateClientCoachAnalysis,
  updateClientFollowUp,
  updateClientLeadScore,
  updateClientPreContactStrategy,
  updateClientRecord,
  updateClientSalesIntelligence,
} from "@/lib/services/contacts.service";
import { createTag, deleteTag } from "@/lib/services/tags.service";
import { logClientEvent, logDetectedEvents } from "@/lib/services/timeline.service";
import { analyzeConversation } from "@/lib/ai/analyze-conversation";
import { analyzeSalesCoach } from "@/lib/ai/coach";
import { calculateLeadScore } from "@/lib/ai/lead-score";
import { generateFollowUp } from "@/lib/ai/follow-up";
import { analyzeSalesIntelligence } from "@/lib/ai/sales-intelligence";
import { detectTimelineEvents } from "@/lib/ai/timeline";
import { generatePreContactStrategy } from "@/lib/ai/pre-contact";
import { computeFollowUpStatus } from "@/config/follow-up";
import { clientInputSchema, tagInputSchema } from "@/lib/validations/client";

export interface ActionResult {
  success: boolean;
  error?: string;
}

/** Registra un evento de línea de tiempo sin bloquear el flujo si falla. */
async function safeLogEvent(clientId: string, eventType: string, description: string) {
  try {
    await logClientEvent(clientId, eventType, description);
  } catch (err) {
    console.error("No se pudo registrar el evento de línea de tiempo:", err);
  }
}

/**
 * Genera la estrategia previa al primer contacto (Módulo 3 del PRD) sin
 * bloquear el flujo si falla — se puede regenerar a mano después.
 */
async function safeGeneratePreContactStrategy(
  clientId: string,
  data: Parameters<typeof generatePreContactStrategy>[0],
) {
  try {
    const strategy = await generatePreContactStrategy(data);
    await updateClientPreContactStrategy(clientId, strategy);
  } catch (err) {
    console.error("No se pudo generar la estrategia previa al contacto:", err);
  }
}

/**
 * Corre en paralelo los seis análisis de IA sobre una conversación (la
 * ficha de datos del viaje, el diagnóstico del coach de ventas, el
 * puntaje del lead, el seguimiento sugerido, el módulo Sales
 * Intelligence y la detección de eventos de línea de tiempo) y guarda
 * cada uno de forma independiente. Uno puede fallar sin afectar a los
 * otros ni al guardado del cliente.
 *
 * `temperatureHint` es la temperatura del análisis anterior (si existe):
 * se usa solo para elegir el umbral de "demasiado tiempo sin responder"
 * del seguimiento, no bloquea nada si todavía no hay ninguna.
 */
async function runAnalyses(
  clientId: string,
  conversation: string,
  lastContactAt: string | null,
  temperatureHint: string | null,
) {
  const followUpStatus = computeFollowUpStatus(lastContactAt, temperatureHint);

  const [dataResult, coachResult, scoreResult, followUpResult, intelligenceResult, timelineResult] =
    await Promise.allSettled([
      analyzeConversation(conversation).then((analysis) => updateClientAnalysis(clientId, analysis)),
      analyzeSalesCoach(conversation).then((analysis) =>
        updateClientCoachAnalysis(clientId, analysis),
      ),
      calculateLeadScore(conversation, lastContactAt).then((score) =>
        updateClientLeadScore(clientId, score),
      ),
      generateFollowUp(conversation, followUpStatus).then((followUp) =>
        updateClientFollowUp(clientId, followUp),
      ),
      analyzeSalesIntelligence(conversation).then((intelligence) =>
        updateClientSalesIntelligence(clientId, intelligence),
      ),
      detectTimelineEvents(conversation).then((events) => logDetectedEvents(clientId, events)),
    ]);

  if (dataResult.status === "rejected") {
    console.error("No se pudo extraer la ficha del cliente:", dataResult.reason);
  }
  if (coachResult.status === "rejected") {
    console.error("No se pudo generar el análisis de venta:", coachResult.reason);
  }
  if (scoreResult.status === "rejected") {
    console.error("No se pudo calcular el puntaje del lead:", scoreResult.reason);
  }
  if (followUpResult.status === "rejected") {
    console.error("No se pudo generar el seguimiento sugerido:", followUpResult.reason);
  }
  if (intelligenceResult.status === "rejected") {
    console.error("No se pudo generar Sales Intelligence:", intelligenceResult.reason);
  }
  if (timelineResult.status === "rejected") {
    console.error("No se pudieron detectar eventos de línea de tiempo:", timelineResult.reason);
  }

  return {
    dataOk: dataResult.status === "fulfilled",
    coachOk: coachResult.status === "fulfilled",
    scoreOk: scoreResult.status === "fulfilled",
    followUpOk: followUpResult.status === "fulfilled",
    intelligenceOk: intelligenceResult.status === "fulfilled",
    timelineOk: timelineResult.status === "fulfilled",
  };
}

function parseClientForm(formData: FormData) {
  return clientInputSchema.safeParse({
    name: formData.get("name"),
    company: formData.get("company"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    productInterest: formData.get("productInterest"),
    leadOrigin: formData.get("leadOrigin"),
    status: formData.get("status"),
    notes: formData.get("notes"),
    conversation: formData.get("conversation"),
    lastContactAt: formData.get("lastContactAt"),
  });
}

function getTagIds(formData: FormData): string[] {
  return formData.getAll("tagIds").map(String).filter(Boolean);
}

export async function createClientAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseClientForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    const client = await createClientRecord(parsed.data);
    const tagIds = getTagIds(formData);
    if (tagIds.length > 0) {
      await setClientTags(client.id, tagIds);
    }
    await safeLogEvent(
      client.id,
      "inquiry_received",
      parsed.data.productInterest
        ? `Consulta recibida sobre ${parsed.data.productInterest}.`
        : "Consulta recibida: se cargó el cliente en el CRM.",
    );
    await safeGeneratePreContactStrategy(client.id, {
      name: client.name,
      company: client.company,
      productInterest: client.productInterest,
      leadOrigin: client.leadOrigin,
      notes: client.notes,
    });
    if (parsed.data.conversation) {
      await runAnalyses(client.id, parsed.data.conversation, client.lastContactAt, null);
    }
    revalidatePath("/contacts");
    revalidatePath("/dashboard");
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }

  redirect("/contacts");
}

export async function updateClientAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseClientForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    const existing = await getClient(id);
    await updateClientRecord(id, parsed.data);
    await setClientTags(id, getTagIds(formData));

    if (existing && parsed.data.status !== existing.status) {
      if (parsed.data.status === "ganado") {
        await safeLogEvent(id, "sale_won", "El cliente pasó a estado Ganado.");
      } else if (parsed.data.status === "perdido") {
        await safeLogEvent(id, "sale_lost", "El cliente pasó a estado Perdido.");
      }
    }

    const conversationChanged =
      !!parsed.data.conversation && parsed.data.conversation !== (existing?.conversation ?? "");
    if (conversationChanged) {
      await runAnalyses(
        id,
        parsed.data.conversation!,
        parsed.data.lastContactAt ?? null,
        existing?.coachAnalysis?.temperature ?? null,
      );
    }

    revalidatePath("/contacts");
    revalidatePath(`/contacts/${id}`);
    revalidatePath("/dashboard");
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }

  redirect(`/contacts/${id}`);
}

export async function deleteClientAction(id: string): Promise<void> {
  await deleteClientRecord(id);
  revalidatePath("/contacts");
  revalidatePath("/dashboard");
  redirect("/contacts");
}

export async function createTagAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = tagInputSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    await createTag(parsed.data);
    revalidatePath("/contacts");
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }

  return { success: true };
}

export async function deleteTagAction(id: string): Promise<void> {
  await deleteTag(id);
  revalidatePath("/contacts");
}

export async function regeneratePreContactStrategyAction(
  clientId: string,
  _prev: ActionResult | null,
): Promise<ActionResult> {
  try {
    const client = await getClient(clientId);
    if (!client) {
      return { success: false, error: "No se encontró el cliente." };
    }
    const strategy = await generatePreContactStrategy({
      name: client.name,
      company: client.company,
      productInterest: client.productInterest,
      leadOrigin: client.leadOrigin,
      notes: client.notes,
    });
    await updateClientPreContactStrategy(clientId, strategy);
    revalidatePath(`/contacts/${clientId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function reanalyzeConversationAction(
  clientId: string,
  _prev: ActionResult | null,
): Promise<ActionResult> {
  try {
    const client = await getClient(clientId);
    if (!client?.conversation?.trim()) {
      return { success: false, error: "Este cliente todavía no tiene una conversación pegada." };
    }
    const { dataOk, coachOk, scoreOk, followUpOk, intelligenceOk, timelineOk } = await runAnalyses(
      clientId,
      client.conversation,
      client.lastContactAt,
      client.coachAnalysis?.temperature ?? null,
    );
    revalidatePath(`/contacts/${clientId}`);
    if (!dataOk && !coachOk && !scoreOk && !followUpOk && !intelligenceOk && !timelineOk) {
      return { success: false, error: "No se pudo completar el análisis. Reintentá en unos minutos." };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
  }
}
