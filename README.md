# SalesCloser AI

CRM con inteligencia artificial especializado exclusivamente en aumentar la
tasa de conversión de ventas. La IA actúa como coach comercial: analiza
conversaciones (pegadas manualmente por ahora) y da feedback accionable.

## Módulo 3 del PRD — Coach antes del primer contacto

Único módulo de IA que corre **sin conversación**: se dispara
automáticamente al crear un cliente, usando solo los datos iniciales
(nombre, empresa, producto consultado, origen del lead, notas). Si
esos datos cambian antes del primer contacto real, hay un botón
"Regenerar estrategia" en la ficha del cliente.

Genera: cómo atacar la consulta, objetivo del primer contacto, tipo de
llamada (Consultiva/Emocional/Directa/Técnica), tono recomendado,
preguntas en el orden en que conviene hacerlas (cada una con su
motivo) e información pendiente de recolectar antes de cotizar.

Es la primera card de la ficha del cliente — literalmente lo primero
que ve el vendedor, antes incluso de Sales Intelligence.

- **Prompt**: `src/lib/ai/prompts.ts` (`PRE_CONTACT_COACH_SYSTEM_PROMPT`)
- **Generación**: `src/lib/ai/pre-contact.ts`
- **Persistencia**: columnas `pre_contact_strategy` (jsonb) y
  `pre_contact_strategy_updated_at` en `clients`
  (`supabase/migrations/0008_pre_contact_strategy.sql`)
- **UI**: `components/features/contacts/PreContactStrategyCard.tsx`

## Documentación de producto

`docs/PRD.md` — visión de producto, principios, arquitectura modular y
los 5 módulos nuevos planificados. Léelo antes de tocar código si vas a
implementar alguno de esos módulos.

`docs/GUIA_SIN_PROGRAMAR.md` — **empezá por acá si nunca tocaste
código.** Paso a paso a clicks (sin terminal, usando GitHub Desktop)
para dejar la aplicación funcionando de cero.

`docs/INSTALACION.md` — la misma puesta en marcha en formato más
compacto, para alguien con algo de familiaridad técnica.

`docs/MANUAL_DE_USO.md` — manual para el día a día del vendedor: cómo
cargar un cliente, qué hace cada módulo de IA automáticamente, buenas
prácticas y preguntas frecuentes.

## Estado actual

- ✅ Arquitectura base (Next.js + Supabase + Tailwind)
- ✅ CRM de clientes: CRUD completo, dashboard, listado, buscador, filtros
  y etiquetas por color — conectado a Supabase con RLS por usuario
- ✅ Análisis automático de conversaciones con IA: ficha resumen +
  checklist de información faltante
- ✅ Coach de ventas experto (SPIN, AIDA, BANT, Challenger, Sandler,
  Chris Voss, Belfort, Cardone, Tracy, Cialdini): diagnóstico táctico +
  3 respuestas sugeridas por conversación
- ✅ Dashboard comercial: ranking de clientes por probabilidad de
  cierre, con filtros (estado, temperatura, etiqueta, rango de %)
- ✅ Puntuación del lead (0-100) con explicación factor por factor
- ✅ Seguimiento inteligente: detecta atraso automáticamente, sugiere
  cuándo y qué escribir sin repetir mensajes anteriores
- ✅ Sales Intelligence: diagnóstico ejecutivo consolidado, arriba de
  todo en la ficha del cliente — no reemplaza ninguno de los análisis
  anteriores, es una lectura adicional de un vistazo
- ✅ Línea de tiempo automática del cliente (7 tipos de evento)
- ✅ Módulo 3 del PRD — Coach antes del primer contacto: estrategia
  generada al crear el cliente, sin necesitar conversación todavía
- ✅ Autenticación con Supabase Auth (login/registro/logout), rutas
  protegidas por middleware
- ⏳ Módulos 1, 2, 4 y 5 del PRD (`docs/PRD.md`) — planificados, todavía
  no implementados
- ⏳ Integración con WhatsApp — deliberadamente fuera de alcance por ahora

## Stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** (strict)
- **TailwindCSS**
- **Supabase** (Auth + Postgres + Storage)
- **Vercel** (despliegue)

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/              # Rutas públicas de autenticación
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Rutas privadas, layout con sidebar
│   │   ├── dashboard/       # Vista general / métricas
│   │   ├── contacts/        # Contactos y leads
│   │   ├── conversations/   # Conversaciones pegadas manualmente
│   │   ├── coach/           # Coach comercial de IA
│   │   └── settings/
│   ├── api/
│   │   ├── ai/              # Endpoints de análisis / sugerencias de IA
│   │   └── webhooks/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                  # Componentes de UI genéricos y reutilizables
│   ├── layout/               # Header, sidebar, shells de layout
│   └── features/            # Componentes específicos de cada feature
│       ├── contacts/
│       ├── conversations/
│       └── coach/
├── lib/
│   ├── supabase/             # Clientes de Supabase (browser / server)
│   ├── ai/                   # Cliente de IA y prompts del coach
│   ├── services/              # Capa de acceso a datos (repository pattern)
│   └── utils/
├── types/                    # Tipos de dominio + tipos generados de Supabase
├── hooks/
├── config/                   # Feature flags y constantes de la app
└── middleware.ts

supabase/
└── migrations/                # Migraciones SQL (vacío por ahora)
```

## Principios de la arquitectura

1. **Route groups por contexto de acceso.** `(auth)` y `(dashboard)` separan
   rutas públicas de privadas sin afectar la URL final.

2. **La UI nunca llama a Supabase directamente.** Los componentes usan
   `lib/services/*`, que encapsula el acceso a datos. Si el día de mañana
   cambia el origen de datos de una entidad, se toca un archivo en
   `services/`, no cada componente que la usa.

3. **La IA está aislada en `lib/ai/`.** El proveedor de IA (Anthropic,
   OpenAI, etc.) y los prompts del coach viven en un único punto de
   entrada, para poder cambiar de proveedor o iterar los prompts sin
   tocar rutas ni componentes.

4. **Feature flags en `config/feature-flags.ts`.** Funcionalidades futuras
   (como la integración con WhatsApp) se agregan detrás de un flag,
   desactivado hasta que estén listas. Así se puede mergear código
   incompleto sin exponerlo.

5. **Tipos de dominio separados de tipos de base de datos.**
   `types/database.ts` reflejará el esquema real de Supabase (generado
   con `supabase gen types`). Los tipos de dominio (`Contact`,
   `Conversation`, `CoachInsight`) son la forma que usa la UI, y pueden
   derivarse o mapearse de los tipos de base de datos sin acoplarse 1:1.

6. **`components/ui` vs `components/features`.** `ui/` son bloques
   genéricos (botón, input, card) sin conocimiento de negocio.
   `features/<nombre>` son componentes que sí conocen el dominio
   (ej. `ContactCard`, `ConversationAnalysis`).

## Módulo de clientes (CRM)

Cada cliente tiene: nombre, empresa, teléfono, correo, producto consultado,
origen del lead, estado, fecha de creación, fecha del último contacto,
notas, conversación completa (pegada manualmente) y etiquetas de color.

- **Esquema**: `supabase/migrations/0001_init.sql` — tablas `clients`,
  `tags`, `client_tags`, con RLS por `owner_id = auth.uid()`.
- **Estados y orígenes editables**: `src/config/crm.ts` — no requieren
  migración para agregar/cambiar valores.
- **Server Actions**: `src/app/(dashboard)/contacts/actions.ts` — crear,
  editar, eliminar cliente; crear/eliminar etiquetas.
- **Páginas**: `/dashboard` (métricas), `/contacts` (listado + buscador +
  filtros + gestor de etiquetas), `/contacts/new`, `/contacts/[id]`
  (ficha completa), `/contacts/[id]/edit`.
- **Búsqueda**: por nombre, empresa, email o teléfono. **Filtros**: por
  estado, origen del lead y etiqueta. Todo vía query params (compartible,
  sin JS extra).

Para aplicar el esquema a tu proyecto de Supabase:

```bash
supabase link --project-ref <tu-project-ref>
supabase db push
```

## Análisis automático de conversaciones (IA)

Cuando se pega o se edita el campo "Conversación completa" de un cliente
(al crearlo o al guardar la edición), la app manda ese texto a Claude y
guarda automáticamente:

- Una **ficha resumen** con los 15 campos extraídos (nombre, destino,
  pasajeros, edad de menores, fecha aproximada, noches, presupuesto,
  hotel solicitado, tipo de viaje, motivo, financiación, ciudad de
  salida, flexibilidad, servicios solicitados y pasaporte vigente).
- Un **checklist** (✔ / ❌) de qué información está y cuál falta,
  calculado a partir de la ficha — no se persiste por separado, así que
  nunca puede desincronizarse de ella.

Si la IA no puede analizar (ej. falta la API key), el cliente se guarda
igual — el análisis se puede reintentar con el botón "Re-analizar
conversación" en la ficha del cliente.

- **Config única**: `src/config/travel-analysis.ts` — agregar un campo
  nuevo ahí alcanza para que se propague al prompt, la ficha y el
  checklist.
- **Extracción**: `src/lib/ai/analyze-conversation.ts` (usa
  `@anthropic-ai/sdk`, requiere `ANTHROPIC_API_KEY` en `.env.local`).
- **Persistencia**: columnas `travel_analysis` (jsonb) y
  `analysis_updated_at` en `clients` (`supabase/migrations/0002_conversation_analysis.sql`).

## Coach de ventas experto (IA)

Con el mismo botón/trigger que el análisis de datos del viaje, la IA
también corre un diagnóstico de venta sobre la conversación, combinando
SPIN Selling, AIDA, BANT, Challenger Sale, Sandler, Chris Voss, Jordan
Belfort, Grant Cardone, Brian Tracy y Robert Cialdini
(`src/config/coach.ts` lista las metodologías; se inyectan en el prompt).

La IA elige internamente qué técnica(s) aplican a esa conversación
puntual antes de responder — esa decisión queda expuesta como
`technique_rationale` así el vendedor entiende el porqué, no solo el
qué. Nunca da consejos genéricos: cada campo tiene que estar anclado en
una técnica concreta.

Devuelve y muestra:

- Etapa del cliente, temperatura, probabilidad de compra
- Nivel de interés, riesgo de abandono, urgencia (cada uno con nivel +
  justificación breve)
- Objeciones detectadas
- Próxima acción recomendada
- 3 respuestas sugeridas, cada una con la técnica en la que se basa y
  por qué funciona en ese momento

- **Prompt**: `src/lib/ai/prompts.ts` (`SALES_COACH_SYSTEM_PROMPT`)
- **Extracción**: `src/lib/ai/coach.ts`
- **Persistencia**: columnas `coach_analysis` (jsonb) y
  `coach_analysis_updated_at` en `clients`
  (`supabase/migrations/0003_sales_coach.sql`)
- **UI**: `components/features/contacts/CoachAnalysisCard.tsx`, en la
  ficha del cliente

## Dashboard comercial

`/dashboard` muestra, además de los totales por estado, un **ranking
comercial**: una tarjeta por cliente con probabilidad de cierre,
temperatura, etapa, último contacto y próxima acción recomendada —
todo tomado del diagnóstico del coach de IA.

Las tarjetas se ordenan automáticamente por probabilidad de cierre
(de mayor a menor). Si un cliente todavía no tiene análisis de IA, va
al final del ranking en vez de mezclarse con los de probabilidad baja.
Los clientes en estado **Ganado** o **Perdido** se excluyen siempre del
ranking (ya no son pipeline activo) — se pueden ver igual en el
listado de `/contacts`.

Filtros disponibles arriba del ranking: por estado (solo abiertos),
temperatura, etiqueta y rango de probabilidad de cierre (mín./máx. %).
Van por query params (`?status=...&temperature=...&tagId=...&minProbability=...&maxProbability=...`),
igual que los filtros de `/contacts`.

- **Score de prioridad**: `getPriorityScore()` en `src/config/coach.ts`
  — usa el porcentaje explícito de la IA si existe; si no, estima a
  partir de la temperatura (caliente/tibio/frío) como fallback.
- **Exclusión de cerrados**: `isClosedStatus()` en `src/config/crm.ts`.
- **UI**: `components/features/contacts/ClientPriorityCard.tsx` y
  `RankingFiltersForm.tsx`

## Sistema de puntuación del lead (0-100)

Con el mismo trigger que los otros dos análisis (crear/editar con
conversación pegada, o "Re-analizar"), la app calcula un puntaje 0-100
que indica qué tan cerca está el cliente de comprar.

Combina dos fuentes:

- **Métricas objetivas, calculadas en código** (gratis, sin IA):
  cantidad de mensajes (aprox., cuenta líneas no vacías del texto
  pegado) y cantidad de preguntas. Ver `lib/utils/conversation-metrics.ts`.
- **Factores cualitativos, evaluados por la IA** leyendo la
  conversación: nivel de interés, presupuesto informado, destino
  definido, fechas definidas, objeciones, urgencia, intención de
  compra, comparación con otras agencias, emociones detectadas y
  tiempo desde el último mensaje.

El resultado siempre viene con una explicación: un resumen general y
un desglose factor por factor (▲ positivo / ▼ negativo / ● neutro) de
por qué el cliente obtuvo ese puntaje puntual — nunca solo el número.

- **Config única**: `src/config/lead-score.ts` (`SCORE_FACTORS`) —
  agregar un factor nuevo ahí alcanza para que se propague al prompt y
  a la UI.
- **Cálculo**: `src/lib/ai/lead-score.ts`
- **Persistencia**: columnas `lead_score` (jsonb) y
  `lead_score_updated_at` en `clients`
  (`supabase/migrations/0004_lead_score.sql`)
- **UI**: `components/features/contacts/LeadScoreCard.tsx`, arriba de
  todo en la ficha del cliente

## Seguimiento inteligente

Combina dos partes con propósitos distintos a propósito:

**1. Detección de atraso — 100% en código, sin IA, siempre fresca.**
`computeFollowUpStatus()` en `src/config/follow-up.ts` calcula en cada
render (no se persiste) los días desde `last_contact_at` y los compara
contra un umbral según la temperatura del cliente (caliente: 2 días,
tibio: 4, frío: 7, default: 5 si no hay temperatura todavía). Por eso
el badge "⏰ Atrasado" — visible tanto en la ficha del cliente como en
las tarjetas del ranking del dashboard — nunca queda desactualizado,
aunque pasen semanas sin volver a analizar la conversación.

**2. Mensaje sugerido — generado por IA, mismo trigger que el resto.**
Cuándo escribir, el mensaje ideal y por qué aumenta la probabilidad de
cierre, anclado en las mismas metodologías de venta del coach. La
regla explícita en el prompt: la IA lee toda la conversación pegada y
tiene prohibido repetir frases, preguntas o argumentos que el
vendedor ya usó ahí — tiene que sumar un ángulo o dato nuevo.

- **Detección**: `src/config/follow-up.ts`
- **Generación**: `src/lib/ai/follow-up.ts` (prompt en `lib/ai/prompts.ts`, `FOLLOW_UP_SYSTEM_PROMPT`)
- **Persistencia**: columna `follow_up` (jsonb) en `clients` — guarda
  solo la parte de IA (timing, mensaje, justificación), nunca los días
  transcurridos ni el estado de atraso, que se recalculan siempre en
  vivo (`supabase/migrations/0005_follow_up.sql`)
- **UI**: `components/features/contacts/FollowUpCard.tsx`, arriba de
  todo en la ficha del cliente; badge de atraso también en
  `ClientPriorityCard.tsx` (ranking del dashboard)

## Sales Intelligence — cerebro comercial consolidado

Módulo independiente que corre en paralelo a los otros cuatro análisis
(ficha de viaje, coach, lead score, seguimiento) cada vez que se
analiza una conversación — **no reemplaza ninguno**, es una quinta
columna más en `clients` y una card nueva, la primera que se ve en la
ficha del cliente, antes de la conversación completa.

Detecta en un solo diagnóstico: etapa comercial, temperatura,
probabilidad de cierre, riesgo de abandono, confianza del cliente,
urgencia, presupuesto detectado, objeciones, intención de compra,
emociones, próxima acción recomendada, mejor técnica de venta,
preguntas pendientes, información del viaje faltante y un resumen
ejecutivo de máximo 6 líneas (el prompt lo pide así y el código además
recorta a 6 líneas por las dudas, en `lib/ai/sales-intelligence.ts`).

Algunos campos se solapan a propósito con el coach o la ficha de viaje
(ej. temperatura, objeciones) — es intencional: esta card tiene que
poder leerse sola, sin necesidad de abrir las otras, como pediste.

- **Prompt**: `src/lib/ai/prompts.ts` (`SALES_INTELLIGENCE_SYSTEM_PROMPT`)
- **Cálculo**: `src/lib/ai/sales-intelligence.ts`
- **Persistencia**: columnas `sales_intelligence` (jsonb) y
  `sales_intelligence_updated_at` en `clients`
  (`supabase/migrations/0006_sales_intelligence.sql`)
- **UI**: `components/features/contacts/SalesIntelligenceCard.tsx`

## Línea de tiempo del cliente

Registra automáticamente 7 tipos de evento, divididos a propósito en
dos grupos según qué tan confiable es detectarlos:

**Determinísticos (en código, sin IA, siempre exactos):**
- *Consulta recibida* — al crear el cliente.
- *Venta cerrada* / *Venta perdida* — al guardar un cambio de estado a
  Ganado o Perdido.

**Detectados por IA (requieren leer la conversación):**
- *Cotización enviada*, *Objeción detectada*, *Seguimiento realizado*,
  *Cliente respondió* — se evalúan cada vez que se analiza una
  conversación (mismo trigger que el resto: pegar/editar, o
  "Re-analizar"), leyendo el texto completo. Pueden repetirse varias
  veces si el hito ocurrió en más de un momento de la charla.

Es intencional no tratar los 7 por igual: inferir con IA si una venta
se cerró o si se recibió una consulta sería menos confiable que
simplemente registrarlo cuando el propio sistema ya sabe que pasó.

Limitación conocida: como la conversación se pega completa cada vez
(no hay mensajes individuales), un mismo hito (ej. una objeción ya
registrada antes) puede volver a detectarse si sigue presente en el
texto en un re-análisis posterior. No hay deduplicación automática
todavía.

- **Tabla**: `client_events` — solo inserción, sin política de update
  (`supabase/migrations/0007_client_events.sql`)
- **Config de tipos**: `src/config/timeline.ts`
- **Detección IA**: `src/lib/ai/timeline.ts`
- **Servicio**: `src/lib/services/timeline.service.ts`
- **UI**: `components/features/contacts/ClientTimeline.tsx`, debajo de
  Sales Intelligence en la ficha del cliente

## Desplegar y usar la aplicación

Ver `docs/INSTALACION.md` (puesta en marcha completa: Supabase, Anthropic,
Vercel, variables de entorno, verificación post-deploy) y
`docs/MANUAL_DE_USO.md` (uso diario para el vendedor).

## Próximos pasos (fuera del alcance de esta fase)

- Diseñar la UI (paleta, tipografía) en `tailwind.config.ts` — el
  prototipo de `salescloser-preview.jsx` propone una dirección visual
  (Fraunces + Inter, paleta teal/dorado) que todavía no se aplicó al
  código real.
- Módulos 1, 2, 4 y 5 del PRD.

## Desarrollo local

```bash
npm install
cp .env.local.example .env.local   # completar con las credenciales de Supabase
npm run dev
```
