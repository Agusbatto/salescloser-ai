import "server-only";
import { getAIClient, AI_MODEL } from "@/lib/ai/client";
import { PRE_CONTACT_COACH_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import type { PreContactStrategy, RecommendedQuestion } from "@/types/pre-contact";

export interface InitialClientData {
  name: string;
  company?: string | null;
  productInterest?: string | null;
  leadOrigin?: string | null;
  notes?: string | null;
}

function emptyStrategy(): PreContactStrategy {
  return {
    approach: null,
    firstContactGoal: null,
    callType: null,
    tone: null,
    recommendedQuestions: [],
    infoToCollect: [],
  };
}

/**
 * Genera la estrategia para el primer contacto a partir de los datos
 * iniciales de la consulta (sin conversación todavía — ver Módulo 3
 * del PRD). Se dispara al crear el cliente, y se puede regenerar a
 * mano si esos datos cambian antes del primer contacto real.
 */
export async function generatePreContactStrategy(
  data: InitialClientData,
): Promise<PreContactStrategy> {
  const hasAnyData = [data.name, data.company, data.productInterest, data.leadOrigin, data.notes]
    .some((v) => v && v.trim().length > 0);
  if (!hasAnyData) {
    return emptyStrategy();
  }

  const userMessage = [
    `Nombre: ${data.name || "No informado"}`,
    `Empresa: ${data.company || "No informado"}`,
    `Producto consultado: ${data.productInterest || "No informado"}`,
    `Origen del lead: ${data.leadOrigin || "No informado"}`,
    `Notas iniciales: ${data.notes || "Sin notas"}`,
  ].join("\n");

  const anthropic = getAIClient();

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 1280,
    system: PRE_CONTACT_COACH_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("La IA no devolvió una respuesta de texto legible.");
  }

  const cleaned = textBlock.text.replace(/```json/gi, "").replace(/```/g, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("No se pudo interpretar la estrategia de la IA como JSON.");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("La respuesta de la IA no tiene el formato esperado.");
  }

  const raw = parsed as Record<string, unknown>;

  const recommendedQuestions: RecommendedQuestion[] = Array.isArray(raw.recommended_questions)
    ? raw.recommended_questions
        .filter((q): q is Record<string, unknown> => !!q && typeof q === "object")
        .map((q, i) => ({
          order: typeof q.order === "number" ? q.order : i + 1,
          question: typeof q.question === "string" ? q.question.trim() : "",
          reason: typeof q.reason === "string" ? q.reason.trim() : "",
        }))
        .filter((q) => q.question.length > 0)
    : [];

  const infoToCollect = Array.isArray(raw.info_to_collect)
    ? raw.info_to_collect.filter((i): i is string => typeof i === "string" && i.trim().length > 0)
    : [];

  return {
    approach: typeof raw.approach === "string" ? raw.approach.trim() : null,
    firstContactGoal: typeof raw.first_contact_goal === "string" ? raw.first_contact_goal.trim() : null,
    callType: typeof raw.call_type === "string" ? raw.call_type.trim() : null,
    tone: typeof raw.tone === "string" ? raw.tone.trim() : null,
    recommendedQuestions,
    infoToCollect,
  };
}
