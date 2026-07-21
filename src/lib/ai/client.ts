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
