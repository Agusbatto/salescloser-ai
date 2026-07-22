import "server-only";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

/**
 * Cliente con la service_role key: ignora RLS por completo. Solo para
 * procesos de sistema sin usuario autenticado en la request (como el
 * cron diario de tareas) — nunca usar esto en una acción disparada por
 * el propio usuario, para eso están `lib/supabase/server.ts` y
 * `client.ts`, que sí respetan RLS.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.",
    );
  }

  return createSupabaseJsClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
