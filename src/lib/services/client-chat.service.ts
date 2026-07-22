import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ClientChatMessage } from "@/types/client-chat";

interface ChatMessageRow {
  id: string;
  role: string;
  content: string;
  image_data_url: string | null;
  created_at: string;
}

export async function listClientChatMessages(clientId: string): Promise<ClientChatMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_chat_messages")
    .select("id, role, content, image_data_url, created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`No se pudo obtener el chat: ${error.message}`);

  return (data as ChatMessageRow[]).map((row) => ({
    id: row.id,
    role: row.role === "assistant" ? "assistant" : "user",
    content: row.content,
    imageDataUrl: row.image_data_url,
    createdAt: row.created_at,
  }));
}

export async function addClientChatMessage(
  clientId: string,
  role: "user" | "assistant",
  content: string,
  imageDataUrl?: string | null,
): Promise<void> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("No hay usuario autenticado");

  const { error } = await supabase.from("client_chat_messages").insert({
    client_id: clientId,
    owner_id: userData.user.id,
    role,
    content,
    image_data_url: imageDataUrl ?? null,
  });

  if (error) throw new Error(`No se pudo guardar el mensaje: ${error.message}`);
}

export async function clearClientChat(clientId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("client_chat_messages").delete().eq("client_id", clientId);
  if (error) throw new Error(`No se pudo borrar el chat: ${error.message}`);
}
