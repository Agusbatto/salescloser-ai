-- Módulo 3 del PRD: estrategia previa al primer contacto. Se calcula a
-- partir de los datos iniciales del cliente (sin conversación), por eso
-- vive en su propia columna independiente del resto de los análisis.

alter table public.clients
  add column if not exists pre_contact_strategy jsonb,
  add column if not exists pre_contact_strategy_updated_at timestamptz;
