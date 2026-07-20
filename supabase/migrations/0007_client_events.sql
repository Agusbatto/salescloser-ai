-- Línea de tiempo del cliente. Tabla de solo-inserción (append-only):
-- cada evento se registra automáticamente (código o IA) y no se edita
-- después, así que no hay policy de update a propósito.

create table if not exists public.client_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null,
  description text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists client_events_client_id_idx
  on public.client_events (client_id, occurred_at desc);

alter table public.client_events enable row level security;

create policy "client_events_select_own" on public.client_events
  for select using (owner_id = auth.uid());
create policy "client_events_insert_own" on public.client_events
  for insert with check (owner_id = auth.uid());
create policy "client_events_delete_own" on public.client_events
  for delete using (owner_id = auth.uid());
