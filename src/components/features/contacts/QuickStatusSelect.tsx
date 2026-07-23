"use client";

import { useTransition } from "react";
import { changeClientStatusAction } from "@/app/(dashboard)/contacts/actions";
import { CLIENT_STATUSES } from "@/config/crm";

export function QuickStatusSelect({
  clientId,
  currentStatus,
}: {
  clientId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={currentStatus}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(() => {
          changeClientStatusAction(clientId, next);
        });
      }}
      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 disabled:opacity-50"
    >
      {CLIENT_STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
