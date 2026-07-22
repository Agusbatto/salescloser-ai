import type { Client } from "@/types/client";
import { computeTripChecklist } from "@/config/trip-checklist";
import { CheckCircle2, XCircle } from "lucide-react";

export function TripInfoCard({ client }: { client: Client }) {
  const checklist = computeTripChecklist(client);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-xs font-medium uppercase text-gray-500">
          Checklist de información
        </h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
          {checklist.map((item) => (
            <div key={item.key} className="flex items-center gap-1.5 text-sm text-gray-700">
              {item.present ? (
                <CheckCircle2 size={14} className="text-green-600" />
              ) : (
                <XCircle size={14} className="text-red-500" />
              )}
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase text-gray-500">Destino combinado</p>
          <p className="text-sm text-gray-900">
            {client.combinedDestinations.length > 0
              ? client.combinedDestinations.join(" → ")
              : "No especificado"}
          </p>
        </div>
        {client.alternativeDestinations.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">Destinos alternativos</p>
            <p className="text-sm text-gray-900">{client.alternativeDestinations.join(", ")}</p>
          </div>
        )}
        <div>
          <p className="text-xs font-medium uppercase text-gray-500">Flexibilidad de fechas</p>
          <p className="text-sm text-gray-900">{client.dateFlexibility || "No especificado"}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-gray-500">Pasajeros</p>
          <p className="text-sm text-gray-900">
            {client.adultsCount ?? 0} adulto(s){client.minorsAges.length > 0 && `, ${client.minorsAges.length} menor(es) (${client.minorsAges.join(", ")} años)`}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-gray-500">Habitaciones</p>
          {client.rooms.length > 0 ? (
            <ul className="text-sm text-gray-900">
              {client.rooms.map((room, i) => (
                <li key={i}>
                  Habitación {i + 1}: {room.adults} adulto(s)
                  {room.minorsAges.length > 0 && `, menores (${room.minorsAges.join(", ")} años)`}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No especificado</p>
          )}
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-gray-500">Vínculo entre pasajeros</p>
          <p className="text-sm text-gray-900">{client.passengerRelationship || "No especificado"}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-gray-500">Motivo del viaje</p>
          <p className="text-sm text-gray-900">{client.tripReason || "No especificado"}</p>
        </div>
      </div>

      {client.additionalInfo && (
        <div>
          <p className="text-xs font-medium uppercase text-gray-500">Información adicional</p>
          <p className="whitespace-pre-wrap text-sm text-gray-700">{client.additionalInfo}</p>
        </div>
      )}
    </div>
  );
}
