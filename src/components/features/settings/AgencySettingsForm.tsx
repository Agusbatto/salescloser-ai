"use client";

import { useActionState } from "react";
import { saveAgencySettingsAction, type SettingsActionResult } from "@/app/(dashboard)/settings/actions";
import type { AgencySettings } from "@/lib/services/agency-settings.service";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function AgencySettingsForm({ settings }: { settings: AgencySettings }) {
  const [state, formAction, isPending] = useActionState<SettingsActionResult | null, FormData>(
    saveAgencySettingsAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Guardado — la IA ya usa estos datos al redactar mensajes.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="fullName">Tu nombre</Label>
          <Input id="fullName" name="fullName" defaultValue={settings.fullName ?? ""} />
        </div>
        <div>
          <Label htmlFor="gender">Tu género (para que la IA conjugue bien)</Label>
          <Input
            id="gender"
            name="gender"
            placeholder="ej. Femenino, Masculino"
            defaultValue={settings.gender ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="agencyName">Nombre de la agencia</Label>
          <Input id="agencyName" name="agencyName" defaultValue={settings.agencyName ?? ""} />
        </div>
        <div>
          <Label htmlFor="agencyLocation">Ubicación de la agencia</Label>
          <Input
            id="agencyLocation"
            name="agencyLocation"
            defaultValue={settings.agencyLocation ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="agencyPhones">Teléfono(s) de la agencia</Label>
          <Input id="agencyPhones" name="agencyPhones" defaultValue={settings.agencyPhones ?? ""} />
        </div>
        <div>
          <Label htmlFor="emergencyPhone">Teléfono de emergencia</Label>
          <Input
            id="emergencyPhone"
            name="emergencyPhone"
            defaultValue={settings.emergencyPhone ?? ""}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="additionalServices">
          Servicios adicionales que la IA puede ofrecer al cerrar
        </Label>
        <p className="mb-1.5 text-xs text-gray-500">
          Un servicio por línea, con su costo — la IA los va a sugerir cuando tenga sentido en la
          conversación, no en cualquier momento. Ejemplo:
        </p>
        <Textarea
          id="additionalServices"
          name="additionalServices"
          rows={6}
          placeholder={
            "Seguro de asistencia al viajero — USD 25 por persona\nTraslado aeropuerto-hotel — USD 40 por auto\nServicio VIP en aeropuerto — USD 60 por persona"
          }
          defaultValue={settings.additionalServices ?? ""}
          className="font-mono text-xs"
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
