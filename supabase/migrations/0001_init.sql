-- SalesCloser AI — esquema inicial del CRM
-- Alcance: clientes (leads), etiquetas y su relación muchos-a-muchos.
-- Todo scoping es por usuario autenticado (owner_id) vía RLS.

create extension if not exists "pgcrypto";

-- =========================================================
-- clients
-- =========================================================
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,

  name text not null,
  company text,
  phone text,
  email text,

  product_interest text,        -- "Producto consultado"
  lead_origin text,              -- "Origen del lead"
  status text not null default 'nuevo',  -- "Estado del cliente"

  notes text,
  conversation text,             -- Conversación completa pegada manualmente

  last_contact_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_owner_id_idx on public.clients (owner_id);
create index if not exists clients_status_idx on public.clients (owner_id, status);
create index if not exists clients_created_at_idx on public.clients (owner_id, created_at desc);

-- Búsqueda simple por nombre / empresa / email / teléfono
create index if not exists clients_search_idx on public.clients
  using gin (
    to_tsvector(
      'simple',
      coalesce(name, '') || ' ' || coalesce(company, '') || ' ' ||
      coalesce(email, '') || ' ' || coalesce(phone, '')
    )
  );

-- =========================================================
-- tags (etiquetas por color)
-- =========================================================
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#6366F1', -- hex color
  created_at timestamptz not null default now(),

  unique (owner_id, name)
);

create index if not exists tags_owner_id_idx on public.tags (owner_id);

-- =========================================================
-- client_tags (relación muchos-a-muchos)
-- =========================================================
create table if not exists public.client_tags (
  client_id uuid not null references public.clients (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (client_id, tag_id)
);

create index if not exists client_tags_tag_id_idx on public.client_tags (tag_id);

-- =========================================================
-- updated_at automático en clients
-- =========================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
  before update on public.clients
  for each row
  execute function public.set_updated_at();

-- =========================================================
-- RLS: cada usuario solo ve/edita sus propios datos
-- =========================================================
alter table public.clients enable row level security;
alter table public.tags enable row level security;
alter table public.client_tags enable row level security;

create policy "clients_select_own" on public.clients
  for select using (owner_id = auth.uid());
create policy "clients_insert_own" on public.clients
  for insert with check (owner_id = auth.uid());
create policy "clients_update_own" on public.clients
  for update using (owner_id = auth.uid());
create policy "clients_delete_own" on public.clients
  for delete using (owner_id = auth.uid());

create policy "tags_select_own" on public.tags
  for select using (owner_id = auth.uid());
create policy "tags_insert_own" on public.tags
  for insert with check (owner_id = auth.uid());
create policy "tags_update_own" on public.tags
  for update using (owner_id = auth.uid());
create policy "tags_delete_own" on public.tags
  for delete using (owner_id = auth.uid());

create policy "client_tags_select_own" on public.client_tags
  for select using (
    exists (select 1 from public.clients c where c.id = client_id and c.owner_id = auth.uid())
  );
create policy "client_tags_insert_own" on public.client_tags
  for insert with check (
    exists (select 1 from public.clients c where c.id = client_id and c.owner_id = auth.uid())
    and exists (select 1 from public.tags t where t.id = tag_id and t.owner_id = auth.uid())
  );
create policy "client_tags_delete_own" on public.client_tags
  for delete using (
    exists (select 1 from public.clients c where c.id = client_id and c.owner_id = auth.uid())
  );
