import { getDashboardStats } from "@/lib/services/contacts.service";
import { listTags } from "@/lib/services/tags.service";
import { getStatusMeta } from "@/config/crm";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ClientPriorityCard } from "@/components/features/contacts/ClientPriorityCard";
import { RankingFiltersForm } from "@/components/features/contacts/RankingFiltersForm";

interface DashboardPageProps {
  searchParams: Promise<{
    status?: string;
    temperature?: string;
    tagId?: string;
    minProbability?: string;
    maxProbability?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const minProbability = params.minProbability ? Number(params.minProbability) : undefined;
  const maxProbability = params.maxProbability ? Number(params.maxProbability) : undefined;

  const [stats, tags] = await Promise.all([
    getDashboardStats({
      status: params.status,
      temperature: params.temperature,
      tagId: params.tagId,
      minProbability,
      maxProbability,
    }),
    listTags(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-xs font-medium uppercase text-gray-500">Total de clientes</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</p>
        </Card>

        {stats.byStatus.map(({ status, count }) => {
          const meta = getStatusMeta(status);
          return (
            <Card key={status}>
              <div className="flex items-center justify-between">
                <Badge label={meta.label} color={meta.color} />
                <p className="text-2xl font-semibold text-gray-900">{count}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div>
        <div className="mb-3">
          <h2 className="text-sm font-medium text-gray-900">Ranking comercial</h2>
          <p className="text-xs text-gray-500">
            Clientes ordenados automáticamente por probabilidad de cierre, según el
            diagnóstico del coach de IA. No incluye clientes Ganados ni Perdidos.
          </p>
        </div>

        <div className="mb-4">
          <RankingFiltersForm tags={tags} defaultValues={params} />
        </div>

        {stats.priorityRanking.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay clientes que coincidan con estos filtros.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {stats.priorityRanking.map((client, index) => (
              <ClientPriorityCard key={client.id} client={client} rank={index + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
