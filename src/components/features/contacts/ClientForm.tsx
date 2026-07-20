"use client";

import { useActionState } from "react";
import type { Client, Tag } from "@/types/client";
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

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

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
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={client?.notes ?? ""} />
      </div>

      <div>
        <Label htmlFor="conversation">Conversación completa</Label>
        <Textarea
          id="conversation"
          name="conversation"
          rows={10}
          placeholder="Pegar acá la conversación completa con el cliente..."
          defaultValue={client?.conversation ?? ""}
          className="font-mono text-xs"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : client ? "Guardar cambios" : "Crear cliente"}
        </Button>
      </div>
    </form>
  );
}
