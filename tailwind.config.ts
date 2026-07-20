import type { Config } from "tailwindcss";

/**
 * Design tokens intencionalmente mínimos por ahora.
 * Cuando se diseñe la UI (fase 2), definir aquí la paleta, tipografía
 * y escalas reales del producto en lugar de usar los defaults de Tailwind.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Placeholder: reemplazar por la paleta de marca de SalesCloser AI
        brand: {
          DEFAULT: "#111827",
        },
      },
    },
  },
  plugins: [],
};

export default config;
