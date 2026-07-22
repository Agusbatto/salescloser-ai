"use client";

import { useRef, useState } from "react";
import { sendScreenshotMessage, type ChatMessage } from "@/app/(dashboard)/coach/actions";
import { Button } from "@/components/ui/Button";
import { CopyMessageButton } from "@/components/ui/CopyMessageButton";
import { downscaleImage, getImageFromClipboard } from "@/lib/utils/image";

export function ScreenshotChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("El archivo tiene que ser una imagen.");
      return;
    }
    setPendingImage(await downscaleImage(file));
    event.target.value = ""; // permite volver a elegir el mismo archivo después
  }

  async function handlePaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const image = getImageFromClipboard(event.clipboardData.items);
    if (!image) return; // no había ninguna imagen en el portapapeles, se pega el texto normal
    event.preventDefault();
    setPendingImage(await downscaleImage(image));
  }

  async function handleSend() {
    if (!input.trim() && !pendingImage) return;

    setError(null);
    const userMessage: ChatMessage = {
      role: "user",
      text: input.trim(),
      imageDataUrl: pendingImage ?? undefined,
    };
    const newHistory = [...messages, userMessage];

    setMessages(newHistory);
    setInput("");
    setPendingImage(null);
    setIsSending(true);

    try {
      const reply = await sendScreenshotMessage(newHistory);
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo analizar. Reintentá en unos minutos.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-lg border border-gray-200 bg-white">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-gray-500">
            Subí una captura de pantalla (con el clip) o pegá acá abajo una conversación
            exportada de WhatsApp (con fecha, hora y remitente) y contame qué necesitás. Te
            sugiero mensajes concretos con la técnica de venta en la que se basa cada uno.
          </p>
        )}
        {messages.map((message, i) => (
          <div key={i} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                message.role === "user" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
              }`}
            >
              {message.imageDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={message.imageDataUrl}
                  alt="Captura de pantalla enviada"
                  className="mb-2 max-h-56 rounded-md"
                />
              )}
              {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
              {message.role === "assistant" && message.text && (
                <div className="mt-1.5 border-t border-gray-200 pt-1">
                  <CopyMessageButton text={message.text} className="text-gray-500" />
                </div>
              )}
            </div>
          </div>
        ))}
        {isSending && <p className="text-sm text-gray-400">Analizando...</p>}
      </div>

      {error && (
        <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      {pendingImage && (
        <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pendingImage} alt="Vista previa" className="h-10 w-10 rounded object-cover" />
          <span className="text-xs text-gray-500">Captura lista para enviar</span>
          <button
            type="button"
            onClick={() => setPendingImage(null)}
            className="text-xs text-red-600 hover:underline"
          >
            Quitar
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-gray-200 p-3">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          title="Adjuntar captura de pantalla"
        >
          📎
        </Button>
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
          placeholder="Escribí, pegá una conversación de WhatsApp, o pegá directo una captura (Ctrl+V)..."
          className="flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
        <Button type="button" onClick={handleSend} disabled={isSending}>
          Enviar
        </Button>
      </div>
    </div>
  );
}
