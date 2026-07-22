import "server-only";

/** Parsea un campo { level, note } devuelto por la IA, tolerando que venga como string suelto. */
export function parseLevelAssessment(raw: unknown): { level: string; note: string } | null {
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const level = typeof obj.level === "string" ? obj.level.trim() : "";
    const note = typeof obj.note === "string" ? obj.note.trim() : "";
    if (!level && !note) return null;
    return { level: level || "—", note };
  }
  if (typeof raw === "string" && raw.trim()) {
    return { level: raw.trim(), note: "" };
  }
  return null;
}

/** Filtra un array devuelto por la IA a solo strings no vacíos. */
export function parseStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

/** Recorta un texto a un máximo de líneas no vacías (por si la IA no respeta el límite pedido). */
export function clampToLines(raw: unknown, maxLines: number): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  return lines.slice(0, maxLines).join("\n");
}
