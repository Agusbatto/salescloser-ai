"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { reanalyzeConversationAction, type ActionResult } from "@/app/(dashboard)/contacts/actions";

export function ReanalyzeButton({ clientId }: { clientId: string }) {
  const boundAction = reanalyzeConversationAction.bind(null, clientId);
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    boundAction,
    null,
  );

  return (
    <form action={formAction} className="flex items-center gap-2">
      <Button type="submit" variant="secondary" disabled={isPending}>
        {isPending ? "Analizando..." : "Re-analizar conversación"}
      </Button>
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
      {state?.success && <span className="text-xs text-green-600">Análisis actualizado</span>}
    </form>
  );
}
