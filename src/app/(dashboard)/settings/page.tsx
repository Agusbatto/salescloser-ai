import { Card } from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Configuración</h1>
      <Card>
        <p className="text-sm text-gray-700">
          Todavía no hay opciones de configuración de cuenta u organización. Para cerrar
          sesión, usá el botón de abajo del menú lateral.
        </p>
      </Card>
    </div>
  );
}
