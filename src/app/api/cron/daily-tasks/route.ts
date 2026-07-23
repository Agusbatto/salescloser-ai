import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isClosedStatus } from "@/config/crm";

/**
 * Corre una vez por día (ver `vercel.json`). Revisa TODOS los clientes
 * de TODOS los usuarios (por eso usa el cliente admin, que ignora RLS)
 * y le crea una tarea a cada cliente abierto que todavía no tenga una
 * para hoy. Así se garantiza "al menos una tarea por día hasta que se
 * cierre" sin que el usuario tenga que hacer nada.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, owner_id, name, status, coach_analysis, sales_intelligence, follow_up");

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const openClients = (clients ?? []).filter((c) => !isClosedStatus(c.status));

  let created = 0;
  for (const client of openClients) {
    const { data: existing } = await supabase
      .from("tasks")
      .select("id")
      .eq("client_id", client.id)
      .eq("due_date", today)
      .limit(1);

    if (existing && existing.length > 0) continue;

    const title =
      client.sales_intelligence?.nextAction ||
      client.coach_analysis?.nextAction ||
      `Hacer seguimiento con ${client.name}`;

    // Usa el mensaje ya redactado por "Analizar conversación" (sin costo
    // de IA nuevo acá) — si todavía no hay ninguno, un texto genérico.
    const description = client.follow_up?.message
      ? `Enviale este mensaje: "${client.follow_up.message}"`
      : "Todavía no hay un mensaje sugerido — entrá al chat del cliente y usá \"Analizar conversación\".";

    const { error: insertError } = await supabase.from("tasks").insert({
      client_id: client.id,
      owner_id: client.owner_id,
      title,
      description,
      due_date: today,
    });

    if (!insertError) created++;
  }

  return NextResponse.json({ ok: true, checked: openClients.length, created });
}
