-- Chat persistente dentro de la ficha de cada cliente. A diferencia del
-- chat de "captura de pantalla" (efímero, en memoria del navegador),
-- este se guarda: el hilo no se pierde entre sesiones.

create table if not exists public.client_chat_messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  role text not null, -- 'user' | 'assistant'
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists client_chat_messages_client_id_idx
  on public.client_chat_messages (client_id, created_at);

alter table public.client_chat_messages enable row level security;

drop policy if exists "client_chat_select_own" on public.client_chat_messages;
create policy "client_chat_select_own" on public.client_chat_messages
  for select using (owner_id = auth.uid());
drop policy if exists "client_chat_insert_own" on public.client_chat_messages;
create policy "client_chat_insert_own" on public.client_chat_messages
  for insert with check (owner_id = auth.uid());
drop policy if exists "client_chat_delete_own" on public.client_chat_messages;
create policy "client_chat_delete_own" on public.client_chat_messages
  for delete using (owner_id = auth.uid());
