-- Módulo Sales Intelligence: diagnóstico ejecutivo consolidado que se
-- calcula con cada análisis de conversación, en paralelo al resto
-- (travel_analysis, coach_analysis, lead_score, follow_up). No los
-- reemplaza ni depende de ellos — es una columna más, independiente.

alter table public.clients
  add column if not exists sales_intelligence jsonb,
  add column if not exists sales_intelligence_updated_at timestamptz;
