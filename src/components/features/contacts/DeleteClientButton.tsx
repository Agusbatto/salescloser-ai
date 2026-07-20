"use client";

import { Button } from "@/components/ui/Button";
import { deleteClientAction } from "@/app/(dashboard)/contacts/actions";

export function DeleteClientButton({ clientId }: { clientId: string }) {
  return (
    <form
      action={deleteClientAction.bind(null, clientId)}
      onSubmit={(e) => {
        if (!confirm("¿Eliminar este cliente? Esta acción no se puede deshacer.")) {
          e.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="danger">
        Eliminar cliente
      </Button>
    </form>
  );
}
