# PRD — SalesCloser AI

**Versión:** 2.0 — de CRM de ventas a asistente inteligente para agentes de viajes
**Estado:** propuesta de arquitectura, sin implementar todavía

---

## 1. Visión del producto

SalesCloser AI deja de ser "un CRM con IA" para pasar a ser un **asistente
inteligente especializado en agentes de viajes**: ayuda a vender más,
conocer mejor a cada cliente, mejorar la técnica comercial del vendedor y
acompañar todo el ciclo de vida del pasajero — desde que llega la consulta
hasta después de que viajó.

El CRM (fichas, dashboard, análisis de conversación) sigue siendo la base.
Los cinco módulos nuevos de este documento se agregan sobre esa base, no
la reemplazan.

## 2. Principios de producto

La IA actúa como experto en ventas, experto en viajes, asesor comercial y
coach del vendedor — pero **nunca reemplaza el criterio humano**. En todo
el producto, sin excepción:

- Explica sus recomendaciones (nunca da un output sin justificar el porqé).
- Nunca inventa información: si un dato no está, se marca como pendiente.
- Prioriza generar confianza por sobre presionar al cliente.
- Busca cerrar ventas mediante valor, no mediante presión.
- El vendedor decide; la IA prepara, sugiere y explica.

Estos principios ya están aplicados en los módulos existentes (ningún
campo se completa si la IA no tiene evidencia en la conversación) y deben
sostenerse en los módulos nuevos.

## 3. Arquitectura general

Se mantiene la arquitectura modular actual — Next.js 15 + TypeScript +
Supabase (Postgres + RLS por usuario) + Tailwind, desplegado en Vercel.
Cada módulo de IA sigue el mismo patrón que los ya implementados:

1. **Prompt propio** en `lib/ai/prompts.ts`, con su propia lógica en
   `lib/ai/<módulo>.ts`.
2. **Columnas o tablas propias** — nunca se sobrescribe el resultado de
   otro módulo. Si dos módulos necesitan un mismo dato, se calcula en cada
   uno por separado o se centraliza en `config/` (como ya pasa con
   `SALES_FRAMEWORKS`).
3. **Guardado independiente y resiliente**: cada módulo se guarda con su
   propia función de servicio; si uno falla, los demás no se ven
   afectados (patrón `Promise.allSettled` ya usado en `runAnalyses`).
4. **Card propia en la UI**, que se agrega sin tocar las cards existentes.

Esto es lo que permite seguir agregando módulos "sin romper el código" —
el mismo principio con el que arrancó el proyecto.

## 4. Estado actual (ya implementado)

| Módulo | Qué hace |
|---|---|
| CRM de clientes | CRUD completo, búsqueda, filtros, etiquetas por color |
| Dashboard comercial | Ranking por probabilidad de cierre, filtros, exclusión de cerrados |
| Ficha de datos del viaje | Extrae 15 campos de la conversación + checklist de faltantes |
| Coach de venta | Diagnóstico con 10 metodologías (SPIN, AIDA, BANT, Challenger, Sandler, Chris Voss, Belfort, Cardone, Tracy, Cialdini) + 3 respuestas sugeridas |
| Puntuación del lead | Score 0-100 con desglose de 12 factores |
| Seguimiento inteligente | Detección de atraso (en código) + mensaje sugerido sin repetir lo ya dicho |
| Sales Intelligence | Diagnóstico ejecutivo consolidado, card superior con resumen de 6 líneas |
| Línea de tiempo | 7 tipos de evento (parte determinística, parte por IA) |

Todos estos análisis se disparan hoy con el mismo trigger: pegar o editar
la conversación completa de un cliente ya creado.

## 5. Módulos nuevos

### Módulo 1 — Carga inteligente de consultas

**Objetivo:** que una consulta nueva, venga de donde venga, se convierta
automáticamente en una ficha de cliente ordenada — hoy el alta es 100%
manual (formulario).

**Fuentes de entrada:**

| Fuente | Estado |
|---|---|
| Texto copiado / pegado | Ya soportado (es el mecanismo actual) |
| Captura de pantalla de Bitrix | Nueva — requiere lectura de imagen (visión), no solo texto |
| Conversación de WhatsApp | Nueva — por ahora como texto exportado/copiado; integración nativa queda para más adelante |
| Correo electrónico | Nueva — por ahora como texto pegado/reenviado |
| Futuras integraciones | Placeholder de arquitectura, sin alcance definido todavía |

**Datos a extraer** (nunca inventar; lo que no aparece queda "Pendiente"):

- *Cliente:* nombre, teléfono, email, ciudad de residencia.
- *Viaje:* destino, fecha estimada, fecha exacta (si existe — son dos
  campos distintos, no uno solo como hoy), noches, adultos, menores,
  edades de menores, ciudad de salida, tipo de viaje, presupuesto, hotel
  solicitado, régimen solicitado, preferencias.
- *Comercial:* nivel de interés, urgencia, objeciones, información
  faltante, probabilidad inicial de compra.

**Salida:** una ficha inicial de cliente creada automáticamente — este
módulo extiende el alta de cliente que ya existe, no la reemplaza (el
formulario manual sigue disponible).

**Relación con lo existente:** varios de estos campos ya se extraen hoy
*después* de crear el cliente (ficha de datos del viaje). La diferencia
es que Módulo 1 corre *en el momento de la carga*, con menos contexto
(una consulta inicial, no una conversación completa), y con fuentes que
hoy no soporta el sistema (imagen, no solo texto).

### Módulo 2 — Informe evolutivo del cliente

**Objetivo:** un informe que se actualiza durante toda la relación
comercial, para que el vendedor aprenda a interpretar a cada cliente.

**Perfil del cliente** (nuevo, no existe hoy):
- Tipo de comprador (analítico, emocional, busca precio, busca
  experiencia, indeciso, necesita aprobación de terceros).
- Sensibilidad al precio, forma de decidir, nivel de confianza,
  motivaciones detectadas, preferencias.

**Línea de tiempo enriquecida:** el Módulo de línea de tiempo ya
implementado registra *qué* pasó (7 tipos de evento). Este módulo agrega,
sobre esa base, el *por qué*: cada evento debería poder explicar qué
cambió, por qué cambió y qué señales concretas de la conversación lo
disparan — hoy el evento tiene una descripción breve, pero no ese nivel
de justificación estructurada.

**Insumos:** este módulo no analiza la conversación desde cero — combina
lo que ya calculan Sales Intelligence, el coach y el puntaje del lead a
lo largo del tiempo, y les da lectura evolutiva (cómo cambió el cliente
entre un análisis y el siguiente).

### Módulo 3 — Coach comercial antes del contacto

**Objetivo:** preparar al vendedor *antes* de escribirle al cliente por
primera vez — es el único módulo de IA que no necesita una conversación
ya existente, solo los datos iniciales (los que carga el Módulo 1 o el
alta manual).

**Debe generar:**
1. Cómo atacar la consulta (estrategia general).
2. Objetivo del primer contacto.
3. Tipo de llamada recomendado (consultiva / emocional / directa / técnica).
4. Tono recomendado (cercano / profesional / entusiasta / tranquilo).
5. Preguntas recomendadas, en orden, con el motivo de cada una.
6. Qué información falta recolectar antes de poder cotizar.

**Relación con lo existente:** el coach de venta actual (`lib/ai/coach.ts`)
analiza una conversación que ya pasó. Este módulo es su contraparte "antes
del primer mensaje" — mismo espíritu, momento distinto, prompt distinto.

### Módulo 4 — Asistente inteligente de destinos

**Objetivo:** cuando se detecta un destino en la ficha de un cliente, dar
al vendedor una sección de conocimiento sobre ese destino para vender con
más criterio.

**Contenido:**
- *Documentación:* requisitos generales, pasaporte, visas, permisos para
  menores.
- *Información del destino:* clima, temporadas, moneda, idioma,
  electricidad, consejos prácticos.
- *Experiencias:* excursiones, paseos, lugares destacados, actividades
  según tipo de pasajero.
- *Tips de venta:* recomendaciones accionables (ej. "familias con niños
  valoran hoteles con actividades infantiles").

**Diferencia de diseño clave:** a diferencia de los demás módulos, el
contenido de un destino **no depende de un cliente puntual** — Punta Cana
es igual para cualquier cliente que viaje ahí. Tiene sentido como una
tabla `destinations` compartida y cacheada (se genera una vez, se
reutiliza), no como un análisis por cliente.

**Punto a decidir (ver sección 7):** requisitos de documentación y visas
cambian con el tiempo — generarlos "de memoria" con IA es riesgoso
(alucinación de datos que importan legalmente). Lo más seguro es
combinar IA con búsqueda web para esa parte puntual, y dejar los tips de
venta como generación pura de IA.

### Módulo 5 — Postventa inteligente

**Objetivo:** una vez que el cliente compra, la relación no termina —
arranca un seguimiento automático hasta después del viaje.

**Cambio de etapa:** el cliente pasa a "confirmado" (hoy el pipeline
termina en "Ganado"; postventa necesita un estado o sub-estado posterior
a ese, para diferenciar "cerró la venta" de "ya viajó").

**Alertas por fecha de viaje:**

| Cuándo | Acción sugerida |
|---|---|
| 30 días antes | Revisar documentación, confirmar datos |
| 20 días antes | Verificar/ofrecer asistencia médica |
| 15 días antes | Enviar vouchers e información del viaje |
| 10 días antes | Consejos del destino, equipaje |
| 7 días antes | Checklist final |
| 48 horas antes | Recordatorio de check-in |
| Después del viaje | Pedir opinión/reseña, mantener relación |

**Requisito estructural:** esto necesita que la fecha del viaje sea un
campo de fecha real (`date`), no texto libre como hoy en la ficha de
datos del viaje — sin eso no se puede calcular "30 días antes" de forma
confiable. También necesita un proceso que corra periódicamente (cron)
para generar las alertas en el momento justo, algo que hoy no existe en
la arquitectura (todo se dispara hoy por acción del usuario, no por
tiempo).

## 6. Cambios transversales que estos módulos requieren

Ninguno de estos rompe lo existente, pero son la base común de varios
módulos nuevos:

- **Fecha del viaje como campo estructurado.** Hoy `approximateDate` es
  texto libre dentro de `travel_analysis`. Postventa (Módulo 5) y parte
  de Carga inteligente (Módulo 1, "fecha exacta") necesitan un campo de
  fecha real para poder calcular plazos.
- **Estado "confirmado" / postventa** en el pipeline comercial, además de
  Ganado/Perdido.
- **Tabla `destinations`** compartida entre clientes (Módulo 4).
- **Un mecanismo de tiempo/cron** para que Postventa pueda disparar
  alertas sin que el usuario tenga que entrar a la app (Vercel Cron Jobs
  es la opción más directa dado el stack actual).
- **Ingesta de imágenes** (visión) para el caso "captura de pantalla de
  Bitrix" del Módulo 1 — hoy la app solo procesa texto.

## 7. Decisiones (confirmadas)

1. **Módulo 1 — captura de Bitrix:** se admite **subida de archivo y
   pegado** (clipboard) — la UI de carga necesita ambos caminos, no solo
   uno.
2. **Módulo 1 — WhatsApp/correo:** se admite **texto pegado y captura de
   pantalla del chat** — incluye el mismo camino de imagen que Bitrix, no
   solo texto. La integración real (conectar la cuenta) queda fuera de
   alcance por ahora.
3. **Módulo 4 — destinos:** por ahora, **generación pura de IA**. A
   futuro, conseguir una API de una web especializada (documentación,
   visas) para reemplazar o validar la parte que hoy genera la IA sola.
   Mientras tanto, la ficha de destino debe dejar claro que la
   documentación/visas conviene verificarla antes de comunicarla al
   cliente (dato sensible, cambia con el tiempo).
4. **Módulo 5 — postventa:** las alertas **crean una tarea dentro de la
   app, asociada al cliente correspondiente** — no es una notificación
   suelta, es una tarea con dueño y contexto (ej. "Enviar vouchers — 15
   días antes del viaje — cliente: Martina López"). Esto implica una
   entidad `tasks` nueva, no solo un recordatorio.
5. **Orden de implementación:** confirmado tal cual se propuso — Módulo
   3 → Módulo 1 → Módulo 2 → Módulo 4 → Módulo 5.

## 8. Orden sugerido de implementación

1. **Módulo 3 (Coach antes del contacto)** — no requiere infraestructura
   nueva, es un prompt más sobre datos que ya existen al crear un cliente.
2. **Módulo 1 (Carga inteligente)**, empezando por texto (WhatsApp/correo
   pegado) y dejando la imagen de Bitrix para una segunda etapa una vez
   resuelta la decisión #1 de la sección anterior.
3. **Módulo 2 (Informe evolutivo)** — extiende la línea de tiempo y usa
   datos que ya se calculan hoy; no depende de los módulos 4 y 5.
4. **Módulo 4 (Destinos)** — depende de la decisión #3 (fuente de datos).
5. **Módulo 5 (Postventa)** — el más grande estructuralmente (fecha real,
   nuevo estado, cron), conviene dejarlo para el final.

## 9. Fuera de alcance de este PRD

- Integraciones reales con Bitrix, WhatsApp Business o casillas de email
  (el Módulo 1 prepara el terreno para leerlas, no las conecta).
- Autenticación de usuarios (sigue pendiente de un PRD anterior).
- Diseño visual / sistema de diseño (sigue pendiente de un PRD anterior).
