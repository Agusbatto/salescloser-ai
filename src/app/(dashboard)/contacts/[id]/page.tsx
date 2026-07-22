import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient } from "@/lib/services/contacts.service";
import { listClientChatMessages } from "@/lib/services/client-chat.service";
import { getStatusMeta } from "@/config/crm";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DeleteClientButton } from "@/components/features/contacts/DeleteClientButton";
import { TripInfoCard } from "@/components/features/contacts/TripInfoCard";
import { CoachAnalysisCard } from "@/components/features/contacts/CoachAnalysisCard";
import { FollowUpCard } from "@/components/features/contacts/FollowUpCard";
import { SalesIntelligenceCard } from "@/components/features/contacts/SalesIntelligenceCard";
import { PreContactStrategyCard } from "@/components/features/contacts/PreContactStrategyCard";
import { RegeneratePreContactButton } from "@/components/features/contacts/RegeneratePreContactButton";
import { ClientChatPanel } from "@/components/features/contacts/ClientChatPanel";

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;
  const [client, chatMessages] = await Promise.all([getClient(id), listClientChatMessages(id)]);
  if (!client) notFound();

  const statusMeta = getStatusMeta(client.status);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{client.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge label={statusMeta.label} color={statusMeta.color} />
            {client.tags.map((tag) => (
              <Badge key={tag.id} label={tag.name} color={tag.color} />
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/contacts/${client.id}/edit`}>
            <Button variant="secondary">Editar</Button>
          </Link>
          <DeleteClientButton clientId={client.id} />
        </div>
      </div>

      {/* Todo apilado en una sola columna, en este orden */}

      <Card>
        <h2 className="mb-3 text-sm font-medium text-gray-900">Chat de este cliente</h2>
        <ClientChatPanel clientId={client.id} initialMessages={chatMessages} />
      </Card>

      <Card>
        <div className="mb-4">
          <h2 className="text-sm font-medium text-gray-900">Seguimiento sugerido (IA)</h2>
          <p className="text-xs text-gray-500">
            La detección de atraso se calcula en el momento; el mensaje se genera
            {client.followUpUpdatedAt
              ? ` y se actualizó ${formatDate(client.followUpUpdatedAt)}.`
              : " con el botón \"Analizar conversación\" del chat."}
          </p>
        </div>
        <FollowUpCard
          lastContactAt={client.lastContactAt}
          temperature={client.coachAnalysis?.temperature}
          followUp={client.followUp}
        />
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-gray-900">Antes del primer contacto</h2>
            <p className="text-xs text-gray-500">
              {client.preContactStrategyUpdatedAt
                ? `Generado ${formatDate(client.preContactStrategyUpdatedAt)}`
                : "Se genera automáticamente al crear el cliente."}
            </p>
          </div>
          <RegeneratePreContactButton clientId={client.id} />
        </div>
        <PreContactStrategyCard strategy={client.preContactStrategy} />
      </Card>

      <Card>
        <div className="mb-4">
          <h2 className="text-sm font-medium text-gray-900">
            Sales Intelligence — diagnóstico ejecutivo
          </h2>
          <p className="text-xs text-gray-500">
            {client.salesIntelligenceUpdatedAt
              ? `Actualizado ${formatDate(client.salesIntelligenceUpdatedAt)}`
              : "Se genera con el botón \"Analizar conversación\" del chat ↑"}
          </p>
        </div>
        <SalesIntelligenceCard data={client.salesIntelligence} />
      </Card>

      <Card className="space-y-5">
        <div>
          <h2 className="text-sm font-medium text-gray-900">Ficha del viaje</h2>
          <p className="text-xs text-gray-500">Cargada a mano — sin costo de IA.</p>
        </div>
        <TripInfoCard client={client} />
      </Card>

      <Card>
        <div className="mb-4">
          <h2 className="text-sm font-medium text-gray-900">Diagnóstico de venta (IA)</h2>
          <p className="text-xs text-gray-500">
            {client.coachAnalysisUpdatedAt
              ? `Actualizado ${formatDate(client.coachAnalysisUpdatedAt)}`
              : "Se genera con el botón \"Analizar conversación\" del chat ↑"}
          </p>
        </div>
        <CoachAnalysisCard analysis={client.coachAnalysis} />
      </Card>

      <Card>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">Empresa</dt>
            <dd className="text-sm text-gray-900">{client.company || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">Teléfono</dt>
            <dd className="text-sm text-gray-900">{client.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">Correo</dt>
            <dd className="text-sm text-gray-900">{client.email || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">Producto consultado</dt>
            <dd className="text-sm text-gray-900">{client.productInterest || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">Origen del lead</dt>
            <dd className="text-sm text-gray-900">{client.leadOrigin || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">Último contacto</dt>
            <dd className="text-sm text-gray-900">{formatDate(client.lastContactAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-gray-500">Cliente desde</dt>
            <dd className="text-sm text-gray-900">{formatDate(client.createdAt)}</dd>
          </div>
        </dl>
      </Card>

      {client.notes && (
        <Card>
          <h2 className="mb-2 text-sm font-medium text-gray-900">Notas</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-700">{client.notes}</p>
        </Card>
      )}
    </div>
  );
}
