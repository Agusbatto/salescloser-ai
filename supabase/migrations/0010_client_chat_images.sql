-- El chat del cliente ahora también acepta imágenes pegadas/subidas
-- (antes era solo texto). Se guardan ya achicadas del lado del
-- navegador (ver `downscaleImage` en el frontend) para no inflar la
-- base de datos con capturas a resolución completa.

alter table public.client_chat_messages
  add column if not exists image_data_url text;
