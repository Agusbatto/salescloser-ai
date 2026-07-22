"use server";

import { revalidatePath } from "next/cache";
import { getClient } from "@/lib/services/contacts.service";
import {
  addClientChatMessage,
  clearClientChat,
  listClientChatMessages,
} from "@/lib/services/client-chat.service";
import { replyInClientChat } from "@/lib/ai/client-chat";

export interface ClientChatResult {
  success: boolean;
  error?: string;
  reply?: string;
}

/**
 * Guarda el mensaje del vendedor, genera la respuesta con el contexto
 * actualizado del cliente + el historial ya guardado, y guarda también
 * esa respuesta. Devuelve el texto de la respuesta para que el chat lo
 * muestre en el momento, sin esperar a un refetch completo.
 */
export async function sendClientChatMessageAction(
  clientId: string,
  message: string,
): Promise<ClientChatResult> {
  const trimmed = message.trim();
  if (!trimmed) {
    return { success: false, error: "Escribí un mensaje primero." };
  }

  try {
    const client = await getClient(clientId);
    if (!client) {
      return { success: false, error: "No se encontró el cliente." };
    }

    const history = await listClientChatMessages(clientId);

    await addClientChatMessage(clientId, "user", trimmed);
    const reply = await replyInClientChat(client, history, trimmed);
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
