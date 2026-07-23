import { getAgencySettings } from "@/lib/services/agency-settings.service";
import { AgencySettingsForm } from "@/components/features/settings/AgencySettingsForm";
import { Card } from "@/components/ui/Card";

export default async function SettingsPage() {
  const settings = await getAgencySettings();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Configuración</h1>
        <p className="mt-1 text-sm text-gray-500">
          Estos datos los usa la IA para firmar mensajes correctamente y ofrecer servicios
          adicionales cuando tenga sentido — en el seguimiento, el diagnóstico de venta y los
          dos chats.
        </p>
      </div>
      <Card>
        <AgencySettingsForm settings={settings} />
      </Card>
    </div>
  );
}
