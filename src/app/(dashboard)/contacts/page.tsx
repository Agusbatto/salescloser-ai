import Link from "next/link";
import { listClients } from "@/lib/services/contacts.service";
import { listTags } from "@/lib/services/tags.service";
import { ClientTable } from "@/components/features/contacts/ClientTable";
import { ClientFilters } from "@/components/features/contacts/ClientFilters";
import { TagManager } from "@/components/features/contacts/TagManager";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface ContactsPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    leadOrigin?: string;
    tagId?: string;
  }>;
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const params = await searchParams;
  const [clients, tags] = await Promise.all([
    listClients({
      search: params.search,
      status: params.status,
      leadOrigin: params.leadOrigin,
      tagId: params.tagId,
    }),
    listTags(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500">{clients.length} en total</p>
        </div>
        <Link href="/contacts/new">
          <Button>Nuevo cliente</Button>
        </Link>
      </div>

      <ClientFilters tags={tags} defaultValues={params} />

      <ClientTable clients={clients} />

      <Card>
        <h2 className="mb-3 text-sm font-medium text-gray-900">Etiquetas</h2>
        <TagManager tags={tags} />
      </Card>
    </div>
  );
}
