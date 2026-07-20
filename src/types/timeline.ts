/** Evento crudo detectado por la IA al leer la conversación, antes de guardarse. */
export interface DetectedEvent {
  type: string;
  description: string;
}

/** Evento ya persistido en la línea de tiempo del cliente. */
export interface ClientEvent {
  id: string;
  type: string;
  description: string | null;
  occurredAt: string;
}
