-- Modalidades de pago (bloques de texto, igual que los servicios) y
-- estructura de servicios que permite marcar cuáles se pueden ofrecer
-- como cortesía. `additional_services` (texto viejo) queda sin usar,
-- no se borra por compatibilidad con lo ya cargado.

alter table public.agency_settings
  add column if not exists payment_methods text,
  add column if not exists additional_services_structured jsonb;
