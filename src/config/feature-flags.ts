/**
 * Feature flags centralizados. El objetivo es poder agregar nuevas
 * funcionalidades (ej. integración con WhatsApp) detrás de un flag,
 * sin afectar el resto de la app hasta que estén listas.
 */
export const featureFlags = {
  whatsappIntegration: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;
