-- La ficha del viaje pasa a cargarse a mano (ya no la extrae la IA de
-- una conversación pegada). Se agregan los campos estructurados nuevos.
-- Las columnas viejas (travel_analysis, lead_score, etc.) quedan en la
-- tabla sin usarse — no se borran acá para no perder datos históricos
-- de quien ya las tenía cargadas, pero el código ya no las lee ni las
-- escribe.

alter table public.clients
  add column if not exists combined_destinations jsonb,   -- array de strings: itinerario combinado, en orden
  add column if not exists alternative_destinations jsonb, -- array de strings: opciones alternativas, no combinadas
  add column if not exists date_flexibility text,
  add column if not exists adults_count integer,
  add column if not exists minors_ages jsonb,              -- array de números (una edad por menor)
  add column if not exists rooms jsonb,                     -- array de { adults: number, minorsAges: number[] }
  add column if not exists passenger_relationship text,
  add column if not exists trip_reason text,
  add column if not exists additional_info text;
