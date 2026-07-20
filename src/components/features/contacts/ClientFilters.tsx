import { CLIENT_STATUSES, LEAD_ORIGINS } from "@/config/crm";
import type { Tag } from "@/types/client";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

interface ClientFiltersProps {
  tags: Tag[];
  defaultValues: {
    search?: string;
    status?: string;
    leadOrigin?: string;
    tagId?: string;
  };
}

/**
 * Filtros implementados como un <form method="get">: no requiere client
 * component ni estado en el cliente, y los filtros quedan en la URL
 * (compartibles, funcionan con back/forward del navegador).
 */
export function ClientFilters({ tags, defaultValues }: ClientFiltersProps) {
  return (
    <form method="get" className="flex flex-wrap items-end gap-3">
      <div className="min-w-[220px] flex-1">
        <Input
          name="search"
          placeholder="Buscar por nombre, empresa, email o teléfono..."
          defaultValue={defaultValues.search}
        />
      </div>

      <div className="w-44">
        <Select name="status" defaultValue={defaultValues.status ?? ""}>
          <option value="">Todos los estados</option>
          {CLIENT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="w-44">
        <Select name="leadOrigin" defaultValue={defaultValues.leadOrigin ?? ""}>
          <option value="">Todos los orígenes</option>
          {LEAD_ORIGINS.map((origin) => (
            <option key={origin} value={origin}>
              {origin}
            </option>
          ))}
        </Select>
      </div>

      {tags.length > 0 && (
        <div className="w-44">
          <Select name="tagId" defaultValue={defaultValues.tagId ?? ""}>
            <option value="">Todas las etiquetas</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      <Button type="submit" variant="secondary">
        Filtrar
      </Button>
      {(defaultValues.search ||
        defaultValues.status ||
        defaultValues.leadOrigin ||
        defaultValues.tagId) && (
        <a
          href="/contacts"
          className="inline-flex items-center justify-center rounded-md px-3.5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Limpiar
        </a>
      )}
    </form>
  );
}
