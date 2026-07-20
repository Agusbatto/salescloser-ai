export interface RecommendedQuestion {
  order: number;
  question: string;
  reason: string;
}

/**
 * Estrategia previa al primer contacto. A diferencia del coach de venta
 * (`types/coach.ts`), que analiza una conversación ya existente, este
 * módulo trabaja SOLO con los datos iniciales de la consulta — corre
 * antes de que exista cualquier conversación.
 */
export interface PreContactStrategy {
  approach: string | null;
  firstContactGoal: string | null;
  callType: string | null;
  tone: string | null;
  recommendedQuestions: RecommendedQuestion[];
  infoToCollect: string[];
}
