"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import {
  regeneratePreContactStrategyAction,
  type ActionResult,
} from "@/app/(dashboard)/contacts/actions";

export function RegeneratePreContactButton({ clientId }: { clientId: string }) {
  const boundAction = regeneratePreContactStrategyAction.bind(null, clientId);
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    boundAction,
    null,
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <Button type="submit" variant="secondary" disabled={isPending}>
        {isPending ? "Generando..." : "Regenerar estrategia"}
      </Button>
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
