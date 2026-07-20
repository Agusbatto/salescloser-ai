import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Punto de entrada único al proveedor de IA. Todo el resto de la app
 * (extracción de conversaciones, futuro coach comercial) pasa por acá,
 * para poder cambiar de modelo o de proveedor tocando un solo archivo.
 */
let client: Anthropic | null = null;

export function getAIClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Falta configurar ANTHROPIC_API_KEY en las variables de entorno.",
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

/**
 * Modelo por defecto para tareas de IA de la app. Centralizado acá para
 * poder actualizarlo en un solo lugar cuando salga una versión nueva.
 */
export const AI_MODEL = "claude-sonnet-5";
