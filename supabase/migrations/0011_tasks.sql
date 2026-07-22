-- Tareas: cada cliente abierto (no Ganado/Perdido) tiene que tener al
-- menos una tarea pendiente por día. Se crean desde dos lugares: al
-- crear el cliente (una inicial) y desde un cron diario que revisa
-- todos los clientes abiertos y les crea una si no tienen ninguna para
-- hoy (ver `api/cron/daily-tasks`).

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  status text not null default 'pending', -- 'pending' | 'done'
  due_date date not null default current_date,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists tasks_owner_id_idx on public.tasks (owner_id, status, due_date);
create index if not exists tasks_client_id_idx on public.tasks (client_id, due_date);

alter table public.tasks enable row level security;

drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own" on public.tasks
  for select using (owner_id = auth.uid());
drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own" on public.tasks
  for insert with check (owner_id = auth.uid());
drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own" on public.tasks
  for update using (owner_id = auth.uid());
drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own" on public.tasks
  for delete using (owner_id = auth.uid());
