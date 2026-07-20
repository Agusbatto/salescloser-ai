import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para uso en Client Components.
 * No usar este cliente en Server Components / Route Handlers: usar
 * `server.ts` para eso.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
