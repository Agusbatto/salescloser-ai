-- Guarda el puntaje 0-100 del lead (mensajes, interés, presupuesto,
-- destino/fechas definidas, objeciones, urgencia, intención de compra,
-- comparación con otras agencias, emociones) y su desglose explicativo.

alter table public.clients
  add column if not exists lead_score jsonb,
  add column if not exists lead_score_updated_at timestamptz;
