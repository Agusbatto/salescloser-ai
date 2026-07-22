import { ScreenshotChat } from "@/components/features/coach/ScreenshotChat";

export default function CoachPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Coach IA</h1>
        <p className="mt-1 text-sm text-gray-500">
          Subí una captura de pantalla de cualquier chat (WhatsApp, Instagram, mail) y te
          sugiero mensajes concretos con las técnicas de venta (SPIN, AIDA, BANT, Challenger,
          Sandler, Chris Voss, Belfort, Cardone, Tracy, Cialdini). Podés seguir pidiendo
          ajustes sobre la misma captura — es una charla, no una consulta de una sola vez.
        </p>
      </div>
      <ScreenshotChat />
    </div>
  );
}
