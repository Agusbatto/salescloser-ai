import Link from "next/link";
import type { Client } from "@/types/client";
import { getStatusMeta } from "@/config/crm";
import { Badge } from "@/components/ui/Badge";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function ClientTable({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">
        No hay clientes que coincidan con la búsqueda/filtros.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2.5 text-left font-medium text-gray-600">Nombre</th>
            <th className="px-4 py-2.5 text-left font-medium text-gray-600">Empresa</th>
            <th className="px-4 py-2.5 text-left font-medium text-gray-600">Producto</th>
            <th className="px-4 py-2.5 text-left font-medium text-gray-600">Origen</th>
            <th className="px-4 py-2.5 text-left font-medium text-gray-600">Estado</th>
            <th className="px-4 py-2.5 text-left font-medium text-gray-600">Etiquetas</th>
            <th className="px-4 py-2.5 text-left font-medium text-gray-600">Último contacto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {clients.map((client) => {
            const statusMeta = getStatusMeta(client.status);
            return (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <Link
                    href={`/contacts/${client.id}`}
                    className="font-medium text-gray-900 hover:underline"
                  >
                    {client.name}
                  </Link>
                  {client.email && (
                    <div className="text-xs text-gray-500">{client.email}</div>
                  )}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{client.company || "—"}</td>
                <td className="px-4 py-2.5 text-gray-600">{client.productInterest || "—"}</td>
                <td className="px-4 py-2.5 text-gray-600">{client.leadOrigin || "—"}</td>
                <td className="px-4 py-2.5">
                  <Badge label={statusMeta.label} color={statusMeta.color} />
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {client.tags.map((tag) => (
                      <Badge key={tag.id} label={tag.name} color={tag.color} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-gray-600">{formatDate(client.lastContactAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
