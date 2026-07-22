import "server-only";
import { callAIChat, compactHistoryIfNeeded, type ChatTurn } from "@/lib/ai/client";
import { CLIENT_CHAT_SYSTEM_PROMPT_BASE } from "@/lib/ai/prompts";
import type { Client } from "@/types/client";
import type { ClientChatMessage } from "@/types/client-chat";

/**
 * Arma un resumen en texto plano de lo que ya se sabe del cliente, para
 * inyectarlo como contexto en cada respuesta. Se reconstruye en cada
 * llamada (no se guarda), así siempre refleja el estado más reciente
 * del cliente, aunque haya cambiado desde el último mensaje del chat.
 *
 * La ficha del viaje ahora es manual (no viene de un análisis de IA de
 * una conversación pegada) — se arma acá a partir de los campos que el
 * vendedor cargó en el formulario.
 */
function buildClientContext(client: Client): string {
  const parts = [
    `Nombre: ${client.name}`,
    `Estado: ${client.status}`,
    client.productInterest ? `Producto consultado: ${client.productInterest}` : null,
    client.combinedDestinations.length > 0
      ? `Destino: ${client.combinedDestinations.join(" → ")}`
      : null,
    client.alternativeDestinations.length > 0
      ? `Destinos alternativos: ${client.alternativeDestinations.join(", ")}`
      : null,
    client.dateFlexibility ? `Flexibilidad de fechas: ${client.dateFlexibility}` : null,
    client.adultsCount
      ? `Pasajeros: ${client.adultsCount} adulto(s)${
          client.minorsAges.length > 0 ? `, menores de ${client.minorsAges.join(", ")} años` : ""
        }`
      : null,
    client.passengerRelationship ? `Vínculo entre pasajeros: ${client.passengerRelationship}` : null,
    client.tripReason ? `Motivo del viaje: ${client.tripReason}` : null,
    client.additionalInfo ? `Información adicional: ${client.additionalInfo}` : null,
    client.coachAnalysis?.stage ? `Etapa comercial: ${client.coachAnalysis.stage}` : null,
    client.coachAnalysis?.temperature ? `Temperatura: ${client.coachAnalysis.temperature}` : null,
    client.salesIntelligence?.executiveSummary
      ? `Resumen ejecutivo del último análisis:\n${client.salesIntelligence.executiveSummary}`
      : null,
  ].filter((part): part is string => !!part);

  return parts.length > 0 ? parts.join("\n") : "Todavía no hay datos cargados de este cliente.";
}

/**
 * Genera la próxima respuesta del chat persistente de un cliente,
 * usando el historial ya guardado + el mensaje nuevo del vendedor.
 */
export async function replyInClientChat(
  client: Client,
  history: ClientChatMessage[],
  newUserMessage: string,
  newImageDataUrl?: string | null,
  agencyContext?: string,
): Promise<string> {
  const systemPrompt = `${CLIENT_CHAT_SYSTEM_PROMPT_BASE}
${agencyContext ? `\nDatos de la agencia (usalos para firmar mensajes y ofrecer servicios adicionales si corresponde):\n${agencyContext}\n` : ""}
Contexto actual de este cliente:
${buildClientContext(client)}`;

  const turns: ChatTurn[] = [
    ...history.map((m) => ({ role: m.role, text: m.content, imageDataUrl: m.imageDataUrl ?? undefined })),
    { role: "user" as const, text: newUserMessage, imageDataUrl: newImageDataUrl ?? undefined },
  ];

  // Compacta solo lo que se le manda a la IA — el historial guardado en
  // `client_chat_messages` (lo que ve el vendedor) no se toca acá.
  const compactedTurns = await compactHistoryIfNeeded(turns);

  const reply = await callAIChat(systemPrompt, compactedTurns, 1024);
  return reply.trim();
}
