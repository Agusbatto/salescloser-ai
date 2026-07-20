-- Guarda el resultado del coach de ventas de IA (SPIN/AIDA/BANT/Challenger/
-- Sandler/Chris Voss/Belfort/Cardone/Tracy/Cialdini) sobre `conversation`.
-- Se persiste separado de `travel_analysis` porque son dos análisis con
-- propósitos distintos (ficha de datos vs. diagnóstico de venta) que
-- pueden fallar o re-ejecutarse de forma independiente.

alter table public.clients
  add column if not exists coach_analysis jsonb,
  add column if not exists coach_analysis_updated_at timestamptz;
