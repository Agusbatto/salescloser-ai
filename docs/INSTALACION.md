# Manual de instalación y configuración — SalesCloser AI

Este manual es para dejar la aplicación funcionando de punta a punta:
Supabase (base de datos + autenticación), Anthropic (IA) y Vercel
(hosting). No requiere experiencia previa con estas herramientas, pero sí
cuentas creadas en las tres.

---

## 1. Qué vas a necesitar antes de empezar

- Una cuenta en [supabase.com](https://supabase.com) (tiene plan gratuito).
- Una cuenta en [console.anthropic.com](https://console.anthropic.com) con
  una API key generada (esto tiene costo por uso — cada análisis de
  conversación consume créditos).
- Una cuenta en [vercel.com](https://vercel.com) (tiene plan gratuito).
- Una cuenta en [github.com](https://github.com) para alojar el código.
- El proyecto (`salescloser-ai.zip`) descomprimido en tu computadora.

---

## 2. Crear el proyecto en Supabase

### 2.1. Crear el proyecto
Entrá a Supabase → **New project** → elegí nombre, contraseña de base de
datos (guardala, no la vas a necesitar para esta app pero es buena
práctica) y región. Esperá a que termine de aprovisionarse (1-2 minutos).

### 2.2. Ejecutar las migraciones
Andá a **SQL Editor** (en el menú lateral) → **New query**. Tenés que
correr, **una por una y en este orden**, el contenido de cada archivo de
`supabase/migrations/`:

| Archivo | Qué crea |
|---|---|
| `0001_init.sql` | Tablas `clients`, `tags`, `client_tags` + seguridad por usuario |
| `0002_conversation_analysis.sql` | Columnas de la ficha de datos del viaje |
| `0003_sales_coach.sql` | Columnas del diagnóstico de venta |
| `0004_lead_score.sql` | Columnas del puntaje del lead |
| `0005_follow_up.sql` | Columnas del seguimiento sugerido |
| `0006_sales_intelligence.sql` | Columnas de Sales Intelligence |
| `0007_client_events.sql` | Tabla `client_events` (línea de tiempo) |
| `0008_pre_contact_strategy.sql` | Columnas de la estrategia previa al contacto |

Abrí cada archivo con un editor de texto, copiá todo el contenido,
pegalo en el SQL Editor y apretá **Run**. Si algún paso da error,
revisá que hayas corrido los anteriores en orden — varios dependen de
que la tabla `clients` ya exista.

### 2.3. Configurar el login por email
Andá a **Authentication → Providers → Email**. Para hacer pruebas más
rápido, podés desactivar la opción **Confirm email** — así una cuenta
nueva queda activa al instante, sin tener que revisar el correo. Si la
dejás activada (recomendado antes de usarla en serio), cada cuenta nueva
va a necesitar confirmarse por mail antes de poder iniciar sesión.

### 2.4. Copiar las credenciales
Andá a **Project Settings → API** y copiá estos tres valores (los vas a
pegar en Vercel en el paso 4):

- **Project URL**
- **anon public key**
- **service_role key** (marcada como secreta — no la compartas)

---

## 3. Conseguir la API key de Anthropic

Entrá a [console.anthropic.com](https://console.anthropic.com) →
**API Keys** → **Create Key**. Copiala — no se vuelve a mostrar
completa después. Vas a necesitar tener un método de pago cargado para
que la key pueda hacer llamadas (Anthropic cobra por uso, no hay plan
gratuito permanente para la API).

---

## 4. Subir el código a GitHub

Con el proyecto descomprimido, desde una terminal:

```bash
cd salescloser-ai
git init
git add .
git commit -m "Initial commit"
```

Creá un repositorio nuevo y vacío en GitHub, y después:

```bash
git remote add origin <la-url-de-tu-repositorio>
git branch -M main
git push -u origin main
```

---

## 5. Desplegar en Vercel

1. En Vercel: **Add New → Project** → elegí el repositorio que acabás
   de subir. Vercel detecta que es Next.js automáticamente, no hace
   falta cambiar ningún comando de build.
2. Antes de darle a Deploy, abrí la sección **Environment Variables** y
   cargá estas cinco:

   | Nombre | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | el Project URL que copiaste en el paso 2.4 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | la anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | la service_role key |
   | `ANTHROPIC_API_KEY` | la API key del paso 3 |
   | `NEXT_PUBLIC_APP_URL` | podés dejarla en blanco y completarla después con la URL que te asigne Vercel |

3. Apretá **Deploy** y esperá a que termine (2-4 minutos la primera vez).

### Si el build falla

El código se escribió sin poder correr `npm install` ni `next build` en
el entorno donde se generó, así que existe la posibilidad de que
aparezca algún error de TypeScript no detectado de antemano. Si pasa:
copiá el error completo de los logs de Vercel (pestaña **Deployments →
[el deploy que falló] → Build Logs**) y compartilo para que se corrija.

---

## 6. Verificar que todo funciona

1. Entrá a la URL que te dio Vercel — te tiene que redirigir a `/login`.
2. Andá a **Registrate**, creá una cuenta con cualquier email/contraseña.
3. Si desactivaste "Confirm email" en el paso 2.3, vas a entrar directo
   al Dashboard. Si no, revisá tu correo y confirmá la cuenta primero.
4. Andá a **Clientes → Nuevo cliente**, completá nombre y pegá una
   conversación de ejemplo en "Conversación completa" → **Crear cliente**.
5. Entrá a la ficha de ese cliente: en unos segundos deberían aparecer
   los análisis (Sales Intelligence, puntaje del lead, etc.). Si después
   de un minuto siguen vacíos, revisá el punto siguiente.

### Si los análisis no aparecen

- Confirmá que `ANTHROPIC_API_KEY` esté bien cargada en Vercel y que la
  cuenta de Anthropic tenga saldo/método de pago activo.
- Los seis módulos de IA fallan en silencio de forma independiente (así
  fue diseñado a propósito, para que uno no bloquee a los demás) — no
  vas a ver un error en pantalla. Para diagnosticar, revisá los logs de
  la función en Vercel (**Deployments → el deploy activo → Functions
  → Logs**), ahí quedan los errores reales.
- Probá el botón **"Re-analizar"** en la ficha del cliente para
  reintentar sin tener que volver a pegar la conversación.

---

## 7. Cómo agregan cuentas los demás vendedores

No hay un panel de administración todavía: cualquiera que sepa la URL
puede **Registrarse** y crear su propia cuenta. Es importante entender
esto: **cada cuenta ve únicamente sus propios clientes** — no hay
todavía una noción de "equipo" o "organización" compartida. Si dos
vendedores necesitan ver los mismos clientes, hoy no es posible; queda
como una limitación conocida a resolver más adelante (no estaba en el
alcance pedido hasta ahora).

---

## 8. Cuando se agreguen módulos nuevos (actualizaciones futuras)

Cada vez que se sume una funcionalidad nueva que toque la base de datos,
va a venir con un archivo de migración nuevo en `supabase/migrations/`
(el siguiente número después de `0008`). Para aplicarlo:

1. Copiá el contenido del archivo nuevo.
2. Pegalo en el SQL Editor de Supabase y ejecutalo.
3. Subí el código nuevo a GitHub (`git push`) — Vercel vuelve a
   desplegar solo, automáticamente, con cada push a la rama principal.

---

## 9. Desarrollo local (opcional)

Si en algún momento querés correr la app en tu computadora en vez de
solo en Vercel:

```bash
npm install
cp .env.local.example .env.local
# completar .env.local con las mismas 5 variables del paso 5
npm run dev
```

Se abre en `http://localhost:3000`.
