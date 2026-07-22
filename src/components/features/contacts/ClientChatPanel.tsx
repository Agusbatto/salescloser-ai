"use client";

import { useState } from "react";
import {
  clearClientChatAction,
  sendClientChatMessageAction,
} from "@/app/(dashboard)/contacts/chat-actions";
import { Button } from "@/components/ui/Button";
import type { ClientChatMessage } from "@/types/client-chat";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export function ClientChatPanel({
  clientId,
  initialMessages,
}: {
  clientId: string;
  initialMessages: ClientChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMsg[]>(
    initialMessages.map((m) => ({ role: m.role, content: m.content })),
  );
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setError(null);
    setIsSending(true);

    const result = await sendClientChatMessageAction(clientId, text);
    setIsSending(false);

    if (!result.success || !result.reply) {
      setError(result.error ?? "No se pudo responder. Reintentá en unos minutos.");
      return;
    }
    setMessages((prev) => [...prev, { role: "assistant", content: result.reply! }]);
  }

  async function handleClear() {
    if (!confirm("¿Borrar todo el historial de este chat? No se puede deshacer.")) return;
    await clearClientChatAction(clientId);
    setMessages([]);
  }

  return (
    <div className="flex h-96 flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="text-xs text-gray-500">
            Charlá acá sobre este cliente — ya conoce su ficha, análisis y conversación. Queda
            todo guardado, no se pierde el hilo entre visitas.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-2.5 py-1.5 text-xs ${
                m.role === "user" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isSending && <p className="text-xs text-gray-400">Escribiendo...</p>}
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      <div className="mt-2 flex items-center gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Escribí acá..."
          className="flex-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
        <Button
          type="button"
          onClick={handleSend}
          disabled={isSending}
          className="px-2.5 py-1.5 text-xs"
        >
          Enviar
        </Button>
      </div>
      <button
        type="button"
        onClick={handleClear}
        className="mt-1.5 self-start text-[11px] text-gray-400 hover:text-red-600"
      >
        Vaciar historial
      </button>
    </div>
  );
}
