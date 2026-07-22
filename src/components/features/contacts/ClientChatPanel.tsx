"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  analyzeChatConversationAction,
  clearClientChatAction,
  sendClientChatMessageAction,
  summarizeChatNowAction,
} from "@/app/(dashboard)/contacts/chat-actions";
import { Button } from "@/components/ui/Button";
import { CopyMessageButton } from "@/components/ui/CopyMessageButton";
import { downscaleImage, getImageFromClipboard } from "@/lib/utils/image";
import type { ClientChatMessage } from "@/types/client-chat";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  imageDataUrl?: string | null;
}

export function ClientChatPanel({
  clientId,
  initialMessages,
}: {
  clientId: string;
  initialMessages: ClientChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMsg[]>(
    initialMessages.map((m) => ({ role: m.role, content: m.content, imageDataUrl: m.imageDataUrl })),
  );
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isWorking, setIsWorking] = useState<"resumir" | "analizar" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("El archivo tiene que ser una imagen.");
      return;
    }
    setPendingImage(await downscaleImage(file));
    event.target.value = "";
  }

  async function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const image = getImageFromClipboard(event.clipboardData.items);
    if (!image) return;
    event.preventDefault();
    setPendingImage(await downscaleImage(image));
  }

  async function handleSend() {
    const text = input.trim();
    if (!text && !pendingImage) return;

    setMessages((prev) => [...prev, { role: "user", content: text, imageDataUrl: pendingImage }]);
    setInput("");
    const imageToSend = pendingImage;
    setPendingImage(null);
    setError(null);
    setIsSending(true);

    const result = await sendClientChatMessageAction(clientId, text, imageToSend);
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

  async function handleSummarizeNow() {
    setIsWorking("resumir");
    setError(null);
    setNotice(null);
    const result = await summarizeChatNowAction(clientId);
    setIsWorking(null);
    if (!result.success || !result.summary) {
      setError(result.error ?? "No se pudo resumir.");
      return;
    }
    setMessages([{ role: "assistant", content: result.summary }]);
  }

  async function handleAnalyze() {
    setIsWorking("analizar");
    setError(null);
    setNotice(null);
    const result = await analyzeChatConversationAction(clientId);
    setIsWorking(null);
    if (!result.success) {
      setError(result.error ?? "No se pudo analizar.");
      return;
    }
    setNotice("Análisis actualizado — mirá las cards de Sales Intelligence y Seguimiento.");
    router.refresh();
  }

  return (
    <div className="flex h-96 flex-col">
      <div className="mb-2 flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={handleSummarizeNow}
            disabled={isWorking !== null}
            title="Resume el historial guardado para bajar el gasto de los próximos mensajes"
            className="rounded-md border border-gray-300 px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {isWorking === "resumir" ? "Resumiendo..." : "Resumir"}
          </button>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isWorking !== null}
            title="Analiza lo escrito en este chat: actualiza Sales Intelligence y Seguimiento"
            className="rounded-md border border-gray-900 bg-gray-900 px-2 py-1 text-[11px] font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isWorking === "analizar" ? "Analizando..." : "Analizar conversación"}
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="text-xs text-gray-500">
            Charlá acá sobre este cliente — ya conoce su ficha, análisis y conversación. Queda
            todo guardado, no se pierde el hilo entre visitas. Podés pegar capturas de pantalla
            de la charla con Ctrl+V.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-2.5 py-1.5 text-xs ${
                m.role === "user" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
              }`}
            >
              {m.imageDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.imageDataUrl}
                  alt="Captura adjunta"
                  className="mb-1.5 max-h-40 rounded-md"
                />
              )}
              {m.content}
              {m.role === "assistant" && m.content && (
                <div className="mt-1 border-t border-gray-200 pt-1">
                  <CopyMessageButton text={m.content} className="text-gray-500" />
                </div>
              )}
            </div>
          </div>
        ))}
        {isSending && <p className="text-xs text-gray-400">Escribiendo...</p>}
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {notice && <p className="mt-1 text-xs text-green-600">{notice}</p>}

      {pendingImage && (
        <div className="mt-1.5 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pendingImage} alt="Vista previa" className="h-8 w-8 rounded object-cover" />
          <span className="text-[11px] text-gray-500">Imagen lista para enviar</span>
          <button
            type="button"
            onClick={() => setPendingImage(null)}
            className="text-[11px] text-red-600 hover:underline"
          >
            Quitar
          </button>
        </div>
      )}

      <div className="mt-2 flex items-center gap-1.5">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Adjuntar captura de pantalla"
          className="rounded-md border border-gray-300 px-2 py-1.5 text-xs hover:bg-gray-50"
        >
          📎
        </button>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          onPaste={handlePaste}
          rows={2}
          placeholder="Escribí, pegá WhatsApp, o pegá una captura (Ctrl+V)..."
          className="flex-1 resize-none rounded-md border border-gray-300 px-2.5 py-1.5 text-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
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
