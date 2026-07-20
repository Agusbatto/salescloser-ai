-- Guarda el resultado del análisis automático de IA sobre `conversation`.
-- Se persiste como jsonb (no una tabla aparte) porque su forma sigue a
-- ANALYSIS_FIELDS en el código, que puede crecer sin requerir migraciones.

alter table public.clients
  add column if not exists travel_analysis jsonb,
  add column if not exists analysis_updated_at timestamptz;
