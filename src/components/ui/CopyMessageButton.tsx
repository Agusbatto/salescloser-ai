"use client";

import { useState } from "react";

/**
 * Copia el texto tal cual (con sus saltos de línea) al portapapeles.
 * Usar esto en vez de "seleccionar y copiar a mano" evita que el
 * usuario tenga que arrastrar la selección dentro de un globo de chat
 * con el texto recortado — copia el contenido completo del mensaje.
 */
export function CopyMessageButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Si el navegador bloquea el portapapeles (poco común), no hacemos nada más.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`text-[11px] underline-offset-2 hover:underline ${className}`}
    >
      {copied ? "Copiado ✓" : "Copiar"}
    </button>
  );
}
