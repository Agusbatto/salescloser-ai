"use client";

import { useActionState, useState } from "react";
import type { Client, Tag, RoomConfig } from "@/types/client";
import { CLIENT_STATUSES, LEAD_ORIGINS } from "@/config/crm";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { ActionResult } from "@/app/(dashboard)/contacts/actions";

interface ClientFormProps {
  client?: Client;
  availableTags: Tag[];
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
}

export function ClientForm({ client, availableTags, action }: ClientFormProps) {
  const [state, formAction, isPending] = useActionState(action, null);
  const selectedTagIds = new Set(client?.tags.map((t) => t.id));

  // Listas dinámicas — se serializan a JSON en inputs ocultos al enviar.
  const [combinedDestinations, setCombinedDestinations] = useState<string[]>(
    client?.combinedDestinations && client.combinedDestinations.length > 0
      ? client.combinedDestinations
      : [""],
  );
  const [alternativeDestinations, setAlternativeDestinations] = useState<string[]>(
    client?.alternativeDestinations ?? [],
  );
  const [minorsAges, setMinorsAges] = useState<number[]>(client?.minorsAges ?? []);
  const [rooms, setRooms] = useState<RoomConfig[]>(client?.rooms ?? []);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      {/* Inputs ocultos con las listas dinámicas serializadas */}
      <input
        type="hidden"
        name="combinedDestinationsJson"
        value={JSON.stringify(combinedDestinations.filter((d) => d.trim()))}
      />
      <input
        type="hidden"
        name="alternativeDestinationsJson"
        value={JSON.stringify(alternativeDestinations.filter((d) => d.trim()))}
      />
      <input type="hidden" name="minorsAgesJson" value={JSON.stringify(minorsAges)} />
      <input type="hidden" name="roomsJson" value={JSON.stringify(rooms)} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" name="name" defaultValue={client?.name} required />
        </div>
        <div>
          <Label htmlFor="company">Empresa</Label>
          <Input id="company" name="company" defaultValue={client?.company ?? ""} />
        </div>
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" name="phone" defaultValue={client?.phone ?? ""} />
        </div>
        <div>
          <Label htmlFor="email">Correo</Label>
          <Input id="email" name="email" type="email" defaultValue={client?.email ?? ""} />
        </div>
        <div>
          <Label htmlFor="productInterest">Producto consultado</Label>
          <Input
            id="productInterest"
            name="productInterest"
            defaultValue={client?.productInterest ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="leadOrigin">Origen del lead</Label>
          <Select id="leadOrigin" name="leadOrigin" defaultValue={client?.leadOrigin ?? ""}>
            <option value="">Seleccionar...</option>
            {LEAD_ORIGINS.map((origin) => (
              <option key={origin} value={origin}>
                {origin}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Estado del cliente</Label>
          <Select id="status" name="status" defaultValue={client?.status ?? "nuevo"}>
            {CLIENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="lastContactAt">Fecha del último contacto</Label>
          <Input
            id="lastContactAt"
            name="lastContactAt"
            type="date"
            defaultValue={client?.lastContactAt?.slice(0, 10) ?? ""}
          />
        </div>
      </div>

      {/* --- Destinos --- */}
      <div className="rounded-lg border border-gray-200 p-4">
        <Label>Destino combinado (itinerario, en orden)</Label>
        <div className="space-y-2">
          {combinedDestinations.map((dest, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={dest}
                placeholder={`Ciudad ${i + 1}`}
                onChange={(e) => {
                  const next = [...combinedDestinations];
                  next[i] = e.target.value;
                  setCombinedDestinations(next);
                }}
              />
              {combinedDestinations.length > 1 && (
                <button
                  type="button"
                  onClick={() => setCombinedDestinations(combinedDestinations.filter((_, idx) => idx !== i))}
                  className="shrink-0 rounded-md border border-gray-300 px-2 text-sm text-gray-500 hover:bg-gray-50"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setCombinedDestinations([...combinedDestinations, ""])}
            className="text-sm font-medium text-gray-700 hover:underline"
          >
            + Agregar destino combinado
          </button>
        </div>

        <div className="mt-4 border-t border-gray-100 pt-4">
          <Label>Destinos alternativos (opciones por separado, no combinadas)</Label>
          <div className="space-y-2">
            {alternativeDestinations.map((dest, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={dest}
                  placeholder="Ciudad alternativa"
                  onChange={(e) => {
                    const next = [...alternativeDestinations];
                    next[i] = e.target.value;
                    setAlternativeDestinations(next);
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setAlternativeDestinations(alternativeDestinations.filter((_, idx) => idx !== i))
                  }
                  className="shrink-0 rounded-md border border-gray-300 px-2 text-sm text-gray-500 hover:bg-gray-50"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setAlternativeDestinations([...alternativeDestinations, ""])}
              className="text-sm font-medium text-gray-700 hover:underline"
            >
              + Agregar destino separado
            </button>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="dateFlexibility">Flexibilidad de fechas</Label>
        <Input
          id="dateFlexibility"
          name="dateFlexibility"
          placeholder="ej. Rígido a esas fechas / flexible +-5 días"
          defaultValue={client?.dateFlexibility ?? ""}
        />
      </div>

      {/* --- Pasajeros --- */}
      <div className="rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="adultsCount">Cantidad de adultos</Label>
            <Input
              id="adultsCount"
              name="adultsCount"
              type="number"
              min={0}
              defaultValue={client?.adultsCount ?? ""}
            />
          </div>
          <div>
            <Label>Cantidad de menores</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">{minorsAges.length}</span>
              <button
                type="button"
                onClick={() => setMinorsAges([...minorsAges, 0])}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
              >
                + Agregar menor
              </button>
            </div>
          </div>
        </div>

        {minorsAges.length > 0 && (
          <div className="mt-3">
            <Label>Edad de cada menor</Label>
            <div className="flex flex-wrap gap-2">
              {minorsAges.map((age, i) => (
                <div key={i} className="flex items-center gap-1">
                  <Input
                    type="number"
                    min={0}
                    max={17}
                    value={age}
                    className="w-16"
                    onChange={(e) => {
                      const next = [...minorsAges];
                      next[i] = Number(e.target.value) || 0;
                      setMinorsAges(next);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setMinorsAges(minorsAges.filter((_, idx) => idx !== i))}
                    className="rounded-md border border-gray-300 px-1.5 text-xs text-gray-500 hover:bg-gray-50"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- Habitaciones --- */}
      <div className="rounded-lg border border-gray-200 p-4">
        <div className="mb-2 flex items-center justify-between">
          <Label>Habitaciones</Label>
          <button
            type="button"
            onClick={() => setRooms([...rooms, { adults: 1, minorsAges: [] }])}
            className="text-sm font-medium text-gray-700 hover:underline"
          >
            + Agregar habitación
          </button>
        </div>

        <div className="space-y-3">
          {rooms.map((room, roomIndex) => (
            <div key={roomIndex} className="rounded-md border border-gray-100 bg-gray-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase text-gray-500">
                  Habitación {roomIndex + 1}
                </span>
                <button
                  type="button"
                  onClick={() => setRooms(rooms.filter((_, idx) => idx !== roomIndex))}
                  className="text-xs text-red-600 hover:underline"
                >
                  Quitar habitación
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-1.5 text-sm text-gray-700">
                  Adultos:
                  <Input
                    type="number"
                    min={0}
                    value={room.adults}
                    className="w-16"
                    onChange={(e) => {
                      const next = [...rooms];
                      next[roomIndex] = { ...room, adults: Number(e.target.value) || 0 };
                      setRooms(next);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const next = [...rooms];
                    next[roomIndex] = { ...room, minorsAges: [...room.minorsAges, 0] };
                    setRooms(next);
                  }}
                  className="text-xs text-gray-600 hover:underline"
                >
                  + Agregar menor a esta habitación
                </button>
              </div>
              {room.minorsAges.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {room.minorsAges.map((age, ageIndex) => (
                    <div key={ageIndex} className="flex items-center gap-1">
                      <Input
                        type="number"
                        min={0}
                        max={17}
                        value={age}
                        className="w-16"
                        onChange={(e) => {
                          const next = [...rooms];
                          const nextAges = [...room.minorsAges];
                          nextAges[ageIndex] = Number(e.target.value) || 0;
                          next[roomIndex] = { ...room, minorsAges: nextAges };
                          setRooms(next);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...rooms];
                          next[roomIndex] = {
                            ...room,
                            minorsAges: room.minorsAges.filter((_, idx) => idx !== ageIndex),
                          };
                          setRooms(next);
                        }}
                        className="rounded-md border border-gray-300 px-1.5 text-xs text-gray-500 hover:bg-gray-50"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {rooms.length === 0 && (
            <p className="text-sm text-gray-400">Todavía no se cargó ninguna habitación.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="passengerRelationship">Vínculo entre pasajeros</Label>
          <Input
            id="passengerRelationship"
            name="passengerRelationship"
            placeholder="ej. Familia, pareja, amigos"
            defaultValue={client?.passengerRelationship ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="tripReason">Motivo del viaje</Label>
          <Input
            id="tripReason"
            name="tripReason"
            placeholder="ej. Luna de miel, vacaciones familiares"
            defaultValue={client?.tripReason ?? ""}
          />
        </div>
      </div>

      {availableTags.length > 0 && (
        <div>
          <Label>Etiquetas</Label>
          <div className="flex flex-wrap gap-3">
            {availableTags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-1.5 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="tagIds"
                  value={tag.id}
                  defaultChecked={selectedTagIds.has(tag.id)}
                  className="rounded border-gray-300"
                />
                <span className="inline-flex items-center gap-1">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="additionalInfo">Información adicional</Label>
        <Textarea
          id="additionalInfo"
          name="additionalInfo"
          rows={3}
          defaultValue={client?.additionalInfo ?? ""}
        />
      </div>

      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={client?.notes ?? ""} />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : client ? "Guardar cambios" : "Crear cliente"}
        </Button>
      </div>
    </form>
  );
}
