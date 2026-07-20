import { notFound } from "next/navigation";
import { getClient } from "@/lib/services/contacts.service";
import { listTags } from "@/lib/services/tags.service";
import { ClientForm } from "@/components/features/contacts/ClientForm";
import { updateClientAction } from "@/app/(dashboard)/contacts/actions";

interface EditClientPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;
  const [client, tags] = await Promise.all([getClient(id), listTags()]);
  if (!client) notFound();

  const boundAction = updateClientAction.bind(null, id);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Editar cliente</h1>
      <ClientForm client={client} availableTags={tags} action={boundAction} />
    </div>
  );
}
