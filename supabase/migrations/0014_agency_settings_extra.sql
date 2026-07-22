-- Dos campos más para que la IA redacte mejor: el tono preferido de
-- comunicación y la moneda habitual en la que se cotiza.

alter table public.agency_settings
  add column if not exists preferred_tone text,
  add column if not exists preferred_currency text;
