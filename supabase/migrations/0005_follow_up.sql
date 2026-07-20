-- Guarda solo la parte generada por IA del seguimiento (timing sugerido,
-- mensaje y justificación). La detección de "atrasado" NO se persiste
-- acá a propósito: se calcula en vivo a partir de `last_contact_at` en
-- cada render, para que nunca quede desactualizada.

alter table public.clients
  add column if not exists follow_up jsonb,
  add column if not exists follow_up_updated_at timestamptz;
