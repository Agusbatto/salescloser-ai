/** Días transcurridos desde una fecha ISO hasta ahora, o null si no hay fecha. */
export function daysSince(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const diffMs = Date.now() - new Date(dateStr).getTime();
  if (Number.isNaN(diffMs)) return null;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}
