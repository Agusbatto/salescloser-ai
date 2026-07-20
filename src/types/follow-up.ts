/**
 * Parte generada por IA del seguimiento: el mensaje ideal para retomar
 * el contacto, cuándo mandarlo y por qué. La detección de "atrasado"
 * (isOverdue/daysSinceLastContact) NO vive acá — se calcula en vivo en
 * `config/follow-up.ts` a partir de `lastContactAt`, para que nunca
 * quede desactualizada.
 */
export interface FollowUpSuggestion {
  recommendedTiming: string | null;
  message: string | null;
  rationale: string | null;
}
