"use client";

import { useActionState, useState } from "react";
import type { Tag } from "@/types/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  createTagAction,
  deleteTagAction,
  type ActionResult,
} from "@/app/(dashboard)/contacts/actions";

const DEFAULT_COLOR = "#6366F1";

export function TagManager({ tags }: { tags: Tag[] }) {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    createTagAction,
    null,
  );
  const [color, setColor] = useState(DEFAULT_COLOR);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <div key={tag.id} className="group flex items-center gap-1">
            <Badge label={tag.name} color={tag.color} />
            <button
              type="button"
              onClick={() => deleteTagAction(tag.id)}
              className="hidden text-xs text-gray-400 hover:text-red-600 group-hover:inline"
              title="Eliminar etiqueta"
            >
              ×
            </button>
          </div>
        ))}
        {tags.length === 0 && (
          <p className="text-sm text-gray-500">Todavía no creaste etiquetas.</p>
        )}
      </div>

      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <Input name="name" placeholder="Nueva etiqueta" className="w-40" required />
        <input
          type="color"
          name="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-9 w-9 cursor-pointer rounded border border-gray-300"
        />
        <Button type="submit" variant="secondary" disabled={isPending}>
          {isPending ? "Creando..." : "Agregar etiqueta"}
        </Button>
        {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
      </form>
    </div>
  );
}
