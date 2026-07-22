"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createClientRecord,
  deleteClientRecord,
  getClient,
  setClientTags,
  updateClientPreContactStrategy,
  updateClientRecord,
} from "@/lib/services/contacts.service";
import { createTag, deleteTag } from "@/lib/services/tags.service";
import { createTask } from "@/lib/services/tasks.service";
import { generatePreContactStrategy } from "@/lib/ai/pre-contact";
import { clientInputSchema, tagInputSchema, toClientInput } from "@/lib/validations/client";

export interface ActionResult {
  success: boolean;
  error?: string;
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
 * El análisis de venta (coach + Sales Intelligence + seguimiento) ya NO
 * se dispara automáticamente al guardar el formulario — se armó a
 * propósito así, para que el gasto de IA sea una decisión manual del
 * vendedor. Ver el botón "Analizar conversación" en el chat del
 * cliente (`chat-actions.ts`, `analyzeChatConversationAction`).
 */
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
    lastContactAt: formData.get("lastContactAt"),
    tripReason: formData.get("tripReason"),
    additionalInfo: formData.get("additionalInfo"),
    passengerRelationship: formData.get("passengerRelationship"),
    dateFlexibility: formData.get("dateFlexibility"),
    adultsCount: formData.get("adultsCount"),
    minorsAgesJson: formData.get("minorsAgesJson"),
    combinedDestinationsJson: formData.get("combinedDestinationsJson"),
    alternativeDestinationsJson: formData.get("alternativeDestinationsJson"),
    roomsJson: formData.get("roomsJson"),
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
    const client = await createClientRecord(toClientInput(parsed.data));
    const tagIds = getTagIds(formData);
    if (tagIds.length > 0) {
      await setClientTags(client.id, tagIds);
    }
    await safeGeneratePreContactStrategy(client.id, {
      name: client.name,
      company: client.company,
      productInterest: client.productInterest,
      leadOrigin: client.leadOrigin,
      notes: client.notes,
    });
    try {
      await createTask(client.id, client.ownerId, `Primer contacto con ${client.name}`);
    } catch (err) {
      console.error("No se pudo crear la tarea inicial:", err);
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
    await updateClientRecord(id, toClientInput(parsed.data));
    await setClientTags(id, getTagIds(formData));

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
