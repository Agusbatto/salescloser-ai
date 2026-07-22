"use client";

import { useActionState, useState } from "react";
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

  const initialBlocks = settings.additionalServices
    ? settings.additionalServices.split("\n").filter((b) => b.trim())
    : [""];
  const [serviceBlocks, setServiceBlocks] = useState<string[]>(
    initialBlocks.length > 0 ? initialBlocks : [""],
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

      <input
        type="hidden"
        name="additionalServicesJson"
        value={JSON.stringify(serviceBlocks.filter((b) => b.trim()))}
      />

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
        <div>
          <Label htmlFor="preferredTone">Tono de comunicación preferido</Label>
          <Input
            id="preferredTone"
            name="preferredTone"
            placeholder="ej. Cercano e informal, Profesional y formal"
            defaultValue={settings.preferredTone ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="preferredCurrency">Moneda habitual para cotizar</Label>
          <Input
            id="preferredCurrency"
            name="preferredCurrency"
            placeholder="ej. USD, ARS"
            defaultValue={settings.preferredCurrency ?? ""}
          />
        </div>
      </div>

      <div>
        <Label>Servicios adicionales que la IA puede ofrecer al cerrar</Label>
        <p className="mb-1.5 text-xs text-gray-500">
          Un bloque por servicio, con su costo — la IA los va a sugerir cuando tenga sentido en
          la conversación, no en cualquier momento.
        </p>
        <div className="space-y-2">
          {serviceBlocks.map((block, i) => (
            <div key={i} className="flex gap-2">
              <Textarea
                rows={2}
                value={block}
                placeholder="ej. Seguro de asistencia al viajero — USD 25 por persona"
                onChange={(e) => {
                  const next = [...serviceBlocks];
                  next[i] = e.target.value;
                  setServiceBlocks(next);
                }}
                className="text-xs"
              />
              {serviceBlocks.length > 1 && (
                <button
                  type="button"
                  onClick={() => setServiceBlocks(serviceBlocks.filter((_, idx) => idx !== i))}
                  className="shrink-0 self-start rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-500 hover:bg-gray-50"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setServiceBlocks([...serviceBlocks, ""])}
            className="text-sm font-medium text-gray-700 hover:underline"
          >
            + Agregar servicio
          </button>
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
