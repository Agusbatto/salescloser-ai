-- Las tareas ahora pueden traer una descripción concreta (por ejemplo,
-- el mensaje ya redactado para mandarle al cliente), no solo un título
-- genérico.

alter table public.tasks
  add column if not exists description text;
