import "server-only";

/**
 * Punto de entrada único al proveedor de IA. Todos los módulos de IA de
 * la app (extracción de conversaciones, coach, puntaje del lead,
 * seguimiento, Sales Intelligence, timeline, estrategia previa al
 * contacto) pasan por acá — así se puede cambiar de modelo o de
 * proveedor tocando un solo archivo.
 *
 * Usa OpenRouter (openrouter.ai) en vez de la API directa de Anthropic:
 * mismo modelo Claude por debajo, pero con un sistema de facturación
 * propio (tarjeta o cripto) independiente del de Anthropic.
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Modelo por defecto para todas las tareas de IA de la app. */
export const AI_MODEL = "anthropic/claude-sonnet-5";

/**
 * Llama a la IA y devuelve el texto plano de la respuesta. Cada módulo
 * de IA le pasa su propio system prompt y su propio mensaje de usuario
 * (la conversación, o los datos que corresponda), y se ocupa de
 * interpretar el texto devuelto (normalmente JSON) como necesite.
 */
export async function callAI(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number,
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Falta configurar OPENROUTER_API_KEY en las variables de entorno.");
  }

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Error de OpenRouter (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("La IA no devolvió una respuesta de texto legible.");
  }

  return content;
}

/** Un turno de una conversación multi-turno con la IA. La imagen es opcional (solo el turno en el que se adjuntó). */
export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
  imageDataUrl?: string;
}

/**
 * Llama a la IA con una conversación completa (varios turnos), donde
 * alguno puede incluir una imagen. Se usa para el chat de "captura de
 * pantalla → sugerencias de venta": el cliente mantiene el historial en
 * memoria y lo reenvía completo en cada mensaje nuevo (la API no tiene
 * memoria propia entre llamadas).
 */
export async function callAIChat(
  systemPrompt: string,
  turns: ChatTurn[],
  maxTokens: number,
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Falta configurar OPENROUTER_API_KEY en las variables de entorno.");
  }

  const messages = [
    { role: "system", content: systemPrompt },
    ...turns.map((turn) =>
      turn.imageDataUrl
        ? {
            role: turn.role,
            content: [
              { type: "text", text: turn.text || "(sin texto, solo la imagen adjunta)" },
              { type: "image_url", image_url: { url: turn.imageDataUrl } },
            ],
          }
        : { role: turn.role, content: turn.text },
    ),
  ];

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: AI_MODEL, max_tokens: maxTokens, messages }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Error de OpenRouter (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("La IA no devolvió una respuesta de texto legible.");
  }

  return content;
}

/**
 * A partir de cuántos turnos se resume el historial en vez de seguir
 * reenviándolo completo. Cada turno de más, después de este número,
 * suma el costo de TODO lo anterior otra vez (la API no tiene memoria
 * propia) — por eso conviene cortar el crecimiento en algún punto.
 */
const COMPACT_AFTER_TURNS = 10;
/** Cuántos turnos recientes se dejan sin resumir, tal cual, después de compactar. */
const KEEP_RECENT_TURNS = 4;

const SUMMARIZE_SYSTEM_PROMPT = `Resumí la conversación que sigue en 3-5 líneas breves, en español. Conservá: qué pidió el usuario, qué sugerencias ya se dieron, decisiones o preferencias mencionadas, y cualquier dato relevante de una imagen si la hubo (describila en palabras, no hace falta la imagen en sí). No agregues nada que no esté en la conversación. Devolvé solo el resumen, sin introducción ni comentarios.`;

/** Resume una lista de turnos en 3-5 líneas. Usado tanto por la compactación automática como por el botón manual "Resumir". */
export async function summarizeConversation(turns: ChatTurn[]): Promise<string> {
  const summary = await callAIChat(SUMMARIZE_SYSTEM_PROMPT, turns, 300);
  return summary.trim();
}

/**
 * Si el historial ya es largo, lo comprime: resume todo menos los
 * últimos turnos con una llamada extra (barata, ~300 tokens de salida)
 * y devuelve un historial mucho más corto para las próximas llamadas.
 * Esto evita que el costo de una charla larga crezca sin límite —
 * después de compactar, el "peso" que se reenvía queda mayormente fijo
 * en vez de acumularse turno a turno.
 *
 * Nunca borra nada de lo que el usuario ve en pantalla: la compactación
 * solo afecta lo que se le manda a la IA como contexto, no el historial
 * que se muestra o se guarda para el usuario.
 */
export async function compactHistoryIfNeeded(turns: ChatTurn[]): Promise<ChatTurn[]> {
  if (turns.length <= COMPACT_AFTER_TURNS) {
    return turns;
  }

  const toSummarize = turns.slice(0, turns.length - KEEP_RECENT_TURNS);
  const recent = turns.slice(turns.length - KEEP_RECENT_TURNS);

  let summary: string;
  try {
    summary = await summarizeConversation(toSummarize);
  } catch {
    // Si el resumen falla por algún motivo, mejor seguir con el historial
    // completo (más caro) que romper la charla.
    return turns;
  }

  return [
    { role: "user", text: `Resumen de lo hablado antes en esta conversación:\n${summary}` },
    ...recent,
  ];
}
