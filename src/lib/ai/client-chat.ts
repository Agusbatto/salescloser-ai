import "server-only";
import { callAIChat, type ChatTurn } from "@/lib/ai/client";
import { CLIENT_CHAT_SYSTEM_PROMPT_BASE } from "@/lib/ai/prompts";
import type { Client } from "@/types/client";
import type { ClientChatMessage } from "@/types/client-chat";

/**
 * Arma un resumen en texto plano de lo que ya se sabe del cliente, para
 * inyectarlo como contexto en cada respuesta. Se reconstruye en cada
 * llamada (no se guarda), así siempre refleja el estado más reciente
 * del cliente, aunque haya cambiado desde el último mensaje del chat.
 */
function buildClientContext(client: Client): string {
  const parts = [
    `Nombre: ${client.name}`,
    `Estado: ${client.status}`,
    client.productInterest ? `Producto consultado: ${client.productInterest}` : null,
    client.coachAnalysis?.stage ? `Etapa comercial: ${client.coachAnalysis.stage}` : null,
    client.coachAnalysis?.temperature ? `Temperatura: ${client.coachAnalysis.temperature}` : null,
    typeof client.leadScore?.score === "number"
      ? `Puntaje del lead: ${client.leadScore.score}/100`
      : null,
    client.salesIntelligence?.executiveSummary
      ? `Resumen ejecutivo:\n${client.salesIntelligence.executiveSummary}`
      : null,
    client.conversation ? `Conversación pegada con el cliente:\n${client.conversation}` : null,
  ].filter((part): part is string => !!part);

  return parts.length > 0 ? parts.join("\n\n") : "Todavía no hay datos cargados de este cliente.";
}

/**
 * Genera la próxima respuesta del chat persistente de un cliente,
 * usando el historial ya guardado + el mensaje nuevo del vendedor.
 */
export async function replyInClientChat(
  client: Client,
  history: ClientChatMessage[],
  newUserMessage: string,
): Promise<string> {
  const systemPrompt = `${CLIENT_CHAT_SYSTEM_PROMPT_BASE}

Contexto actual de este cliente:
${buildClientContext(client)}`;

  const turns: ChatTurn[] = [
    ...history.map((m) => ({ role: m.role, text: m.content })),
    { role: "user" as const, text: newUserMessage },
  ];

  const reply = await callAIChat(systemPrompt, turns, 1024);
  return reply.trim();
}
