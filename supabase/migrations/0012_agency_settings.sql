-- Datos de la agencia/vendedor que la IA usa para redactar mensajes:
-- firma con el nombre correcto, menciona teléfonos si hace falta, y
-- puede ofrecer servicios adicionales (con costo) al cerrar una venta.
-- Una fila por usuario (owner_id es la clave primaria).

create table if not exists public.agency_settings (
  owner_id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  gender text,
  agency_name text,
  agency_location text,
  agency_phones text,
  emergency_phone text,
  additional_services text,
  updated_at timestamptz not null default now()
);

alter table public.agency_settings enable row level security;

drop policy if exists "agency_settings_select_own" on public.agency_settings;
create policy "agency_settings_select_own" on public.agency_settings
  for select using (owner_id = auth.uid());
drop policy if exists "agency_settings_insert_own" on public.agency_settings;
create policy "agency_settings_insert_own" on public.agency_settings
  for insert with check (owner_id = auth.uid());
drop policy if exists "agency_settings_update_own" on public.agency_settings;
create policy "agency_settings_update_own" on public.agency_settings
  for update using (owner_id = auth.uid());
