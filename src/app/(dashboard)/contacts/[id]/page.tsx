import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient } from "@/lib/services/contacts.service";
import { listClientEvents } from "@/lib/services/timeline.service";
import { getStatusMeta } from "@/config/crm";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DeleteClientButton } from "@/components/features/contacts/DeleteClientButton";
import { TravelAnalysisSummary } from "@/components/features/contacts/TravelAnalysisSummary";
import { AnalysisChecklist } from "@/components/features/contacts/AnalysisChecklist";
import { CoachAnalysisCard } from "@/components/features/contacts/CoachAnalysisCard";
import { LeadScoreCard } from "@/components/features/contacts/LeadScoreCard";
import { FollowUpCard } from "@/components/features/contacts/FollowUpCard";
import { SalesIntelligenceCard } from "@/components/features/contacts/SalesIntelligenceCard";
import { PreContactStrategyCard } from "@/components/features/contacts/PreContactStrategyCard";
import { RegeneratePreContactButton } from "@/components/features/contacts/RegeneratePreContactButton";
import { ClientTimeline } from "@/components/features/contacts/ClientTimeline";
import { ReanalyzeButton } from "@/components/features/contacts/ReanalyzeButton";

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
  const [client, events] = await Promise.all([getClient(id), listClientEvents(id)]);
  if (!client) notFound();

  const statusMeta = getStatusMeta(client.status);

  return (
    <div className="max-w-7xl space-y-6">
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

      {/* Layout de escritorio: columna principal (2/3) + rail de actividad (1/3) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
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
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-900">
                  Sales Intelligence — diagnóstico ejecutivo
                </h2>
                <p className="text-xs text-gray-500">
                  {client.salesIntelligenceUpdatedAt
                    ? `Actualizado ${formatDate(client.salesIntelligenceUpdatedAt)}`
                    : "Se genera junto con el resto del análisis."}
                </p>
              </div>
              <ReanalyzeButton clientId={client.id} />
            </div>
            <SalesIntelligenceCard data={client.salesIntelligence} />
          </Card>

          <Card className="space-y-5">
            <div>
              <h2 className="text-sm font-medium text-gray-900">Ficha resumen del viaje (IA)</h2>
              <p className="text-xs text-gray-500">
                {client.analysisUpdatedAt
                  ? `Actualizado ${formatDate(client.analysisUpdatedAt)}`
                  : "Todavía no se analizó ninguna conversación."}
              </p>
            </div>
            <AnalysisChecklist analysis={client.travelAnalysis} />
            <TravelAnalysisSummary analysis={client.travelAnalysis} />
          </Card>

          <Card>
            <div className="mb-4">
              <h2 className="text-sm font-medium text-gray-900">Diagnóstico de venta (IA)</h2>
              <p className="text-xs text-gray-500">
                {client.coachAnalysisUpdatedAt
                  ? `Actualizado ${formatDate(client.coachAnalysisUpdatedAt)}`
                  : "Se genera junto con la ficha resumen, con el mismo botón."}
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

          <Card>
            <h2 className="mb-2 text-sm font-medium text-gray-900">Conversación completa</h2>
            {client.conversation ? (
              <pre className="whitespace-pre-wrap font-mono text-xs text-gray-700">
                {client.conversation}
              </pre>
            ) : (
              <p className="text-sm text-gray-500">No se pegó ninguna conversación todavía.</p>
            )}
          </Card>
        </div>

        {/* Rail derecho: estado y actividad, visible sin tener que bajar toda la columna principal */}
        <div className="space-y-6 xl:col-span-1">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-900">Puntaje del lead (IA)</h2>
                <p className="text-xs text-gray-500">
                  {client.leadScoreUpdatedAt
                    ? `Actualizado ${formatDate(client.leadScoreUpdatedAt)}`
                    : "Se genera junto con el resto del análisis."}
                </p>
              </div>
            </div>
            <LeadScoreCard leadScore={client.leadScore} />
          </Card>

          <Card>
            <div className="mb-4">
              <h2 className="text-sm font-medium text-gray-900">Seguimiento sugerido (IA)</h2>
              <p className="text-xs text-gray-500">
                La detección de atraso se calcula en el momento; el mensaje se genera
                {client.followUpUpdatedAt
                  ? ` y se actualizó ${formatDate(client.followUpUpdatedAt)}.`
                  : " junto con el resto del análisis."}
              </p>
            </div>
            <FollowUpCard
              lastContactAt={client.lastContactAt}
              temperature={client.coachAnalysis?.temperature}
              followUp={client.followUp}
            />
          </Card>

          <Card>
            <div className="mb-4">
              <h2 className="text-sm font-medium text-gray-900">Línea de tiempo</h2>
              <p className="text-xs text-gray-500">
                Se registra automáticamente: consulta recibida y venta ganada/perdida al
                guardar, cotización enviada / objeción detectada / seguimiento realizado /
                cliente respondió al analizar la conversación.
              </p>
            </div>
            <ClientTimeline events={events} />
          </Card>
        </div>
      </div>
    </div>
  );
}
