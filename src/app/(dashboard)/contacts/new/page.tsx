import { listTags } from "@/lib/services/tags.service";
import { ClientForm } from "@/components/features/contacts/ClientForm";
import { createClientAction } from "@/app/(dashboard)/contacts/actions";

export default async function NewClientPage() {
  const tags = await listTags();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Nuevo cliente</h1>
      <ClientForm availableTags={tags} action={createClientAction} />
    </div>
  );
}
