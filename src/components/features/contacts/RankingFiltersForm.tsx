import { CLIENT_STATUSES } from "@/config/crm";
import { TEMPERATURE_OPTIONS } from "@/config/coach";
import type { Tag } from "@/types/client";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

interface RankingFiltersFormProps {
  tags: Tag[];
  defaultValues: {
    status?: string;
    temperature?: string;
    tagId?: string;
    minProbability?: string;
    maxProbability?: string;
  };
}

// Solo estados abiertos: ganado/perdido ya se excluyen siempre del ranking.
const OPEN_STATUSES = CLIENT_STATUSES.filter((s) => s.value !== "ganado" && s.value !== "perdido");

export function RankingFiltersForm({ tags, defaultValues }: RankingFiltersFormProps) {
  const hasFilters = !!(
    defaultValues.status ||
    defaultValues.temperature ||
    defaultValues.tagId ||
    defaultValues.minProbability ||
    defaultValues.maxProbability
  );

  return (
    <form method="get" className="flex flex-wrap items-end gap-3">
      <div className="w-48">
        <Label htmlFor="rf-status">Estado</Label>
        <Select id="rf-status" name="status" defaultValue={defaultValues.status ?? ""}>
          <option value="">Todos los estados abiertos</option>
          {OPEN_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="w-40">
        <Label htmlFor="rf-temperature">Temperatura</Label>
        <Select id="rf-temperature" name="temperature" defaultValue={defaultValues.temperature ?? ""}>
          <option value="">Todas</option>
          {TEMPERATURE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>

      {tags.length > 0 && (
        <div className="w-40">
          <Label htmlFor="rf-tag">Etiqueta</Label>
          <Select id="rf-tag" name="tagId" defaultValue={defaultValues.tagId ?? ""}>
            <option value="">Todas</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="w-24">
        <Label htmlFor="rf-min">Prob. mín. %</Label>
        <Input
          id="rf-min"
          name="minProbability"
          type="number"
          min={0}
          max={100}
          defaultValue={defaultValues.minProbability}
        />
      </div>

      <div className="w-24">
        <Label htmlFor="rf-max">Prob. máx. %</Label>
        <Input
          id="rf-max"
          name="maxProbability"
          type="number"
          min={0}
          max={100}
          defaultValue={defaultValues.maxProbability}
        />
      </div>

      <Button type="submit" variant="secondary">
        Filtrar
      </Button>
      {hasFilters && (
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md px-3.5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Limpiar
        </a>
      )}
    </form>
  );
}
