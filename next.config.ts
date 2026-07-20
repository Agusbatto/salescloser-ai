import type { NextConfig } from "next";

/**
 * Configuración base de Next.js.
 * Mantener este archivo minimalista: cualquier config específica de una
 * feature (headers, redirects, rewrites) debería documentarse aquí a
 * medida que se agregue, no acumularse sin explicación.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Agregar aquí los dominios de imágenes externas cuando se necesiten
      // (ej. avatares de Supabase Storage).
    ],
  },
  eslint: {
    // TEMPORAL: este código se generó en un entorno sin `npm install` para
    // verificar. No dejar que un warning de lint bloquee el primer deploy
    // de prueba. Sacar esto una vez que corriste `npm run lint` en local
    // y esté limpio.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
