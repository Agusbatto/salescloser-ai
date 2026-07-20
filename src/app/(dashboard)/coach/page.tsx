import { Card } from "@/components/ui/Card";

export default function CoachPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Coach IA</h1>
      <Card>
        <p className="text-sm text-gray-700">
          Todavía no hay una vista general de coaching acá. Por ahora, el diagnóstico de
          venta (SPIN, AIDA, BANT, Challenger, Sandler, Chris Voss, Belfort, Cardone, Tracy
          y Cialdini) está disponible dentro de la ficha de cada cliente, en la card
          "Diagnóstico de venta (IA)".
        </p>
      </Card>
    </div>
  );
}
