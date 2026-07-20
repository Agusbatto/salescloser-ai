import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilidad estándar para combinar clases de Tailwind sin colisiones.
 * Usar en todos los componentes en lugar de concatenar strings a mano.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
