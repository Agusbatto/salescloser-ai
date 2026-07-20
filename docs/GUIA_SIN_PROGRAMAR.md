# Guía paso a paso — sin saber programar

Esta guía asume que nunca tocaste código y no sabés qué es una terminal.
Vamos a hacer todo a clicks, con dos aplicaciones con botones (no líneas
de comando). Calculá entre 45 minutos y 1 hora la primera vez, con
tiempos de espera incluidos.

**Si en algún paso algo no coincide con lo que ves en pantalla** (los
sitios web cambian el diseño de vez en cuando), no sigas adivinando —
copiame una captura de pantalla o describime qué ves y seguimos desde ahí.

---

## Antes de arrancar: qué es cada cosa

Vas a crear cuenta en 4 servicios. Para que no sea una lista de nombres
sin sentido, esto es lo que hace cada uno:

| Servicio | Para qué sirve | ¿Tiene costo? |
|---|---|---|
| **Supabase** | Es donde vive guardada toda la información: tus clientes, sus conversaciones, todo. Como una base de datos. | Gratis para este uso |
| **Anthropic** | Es el proveedor de la Inteligencia Artificial que lee las conversaciones y arma los análisis. | **Es el único que se paga** |
| **GitHub** | Es donde vas a "depositar" el código de la aplicación, para que Vercel lo pueda leer y ponerlo en funcionamiento. | Gratis para este uso |
| **Vercel** | Es donde la aplicación queda funcionando de verdad, con una dirección web (URL) que vas a poder abrir desde cualquier lado. | Gratis para este uso |

## Lo que necesitás tener a mano

- Una computadora (Windows o Mac).
- El archivo `salescloser-ai.zip` descargado en tu computadora (te lo
  pasé en un mensaje anterior — si no lo tenés a mano, avisame y te lo
  vuelvo a compartir).
- Un mail que uses habitualmente.
- Una tarjeta de crédito o débito (solo la vas a cargar en Anthropic,
  es el único paso pago — para lo demás no hace falta).
- Un archivo de texto abierto (Bloc de notas en Windows, Notas en Mac)
  para ir pegando ahí las claves que vayamos generando, así no se
  pierden. Los vamos a necesitar más adelante, todos juntos.

---

## PARTE 1 — Descomprimir el proyecto

1. Buscá el archivo `salescloser-ai.zip` que descargaste (normalmente
   está en la carpeta "Descargas").
2. **Windows**: hacé clic derecho sobre el archivo → **"Extraer todo..."**
   → **Extraer**. Se va a crear una carpeta nueva llamada `salescloser-ai`.
3. **Mac**: doble clic sobre el archivo. Se va a crear la carpeta sola,
   al lado del zip.
4. Anotá dónde quedó esa carpeta (por ejemplo, Escritorio o Descargas)
   — la vas a necesitar en la Parte 7.

---

## PARTE 2 — Crear el proyecto en Supabase (la base de datos)

1. Andá a **[supabase.com](https://supabase.com)** en tu navegador.
2. Arriba a la derecha, **Start your project** (o **Sign up**).
3. Podés crear la cuenta con tu cuenta de GitHub (si ya tenés una) o con
   mail y contraseña — cualquiera de las dos sirve, es solo para entrar.
4. Una vez adentro, hacé clic en **New Project**.
5. Completá:
   - **Name**: `salescloser-ai` (o el nombre que quieras).
   - **Database Password**: generá o escribí una contraseña — **copiala
     al Bloc de notas que abriste antes**, con la etiqueta "contraseña
     de base de datos". No la vas a necesitar para usar la aplicación,
     pero es mejor tenerla guardada.
   - **Region**: elegí la más cercana a donde estés (por ejemplo, South
     America si estás en Uruguay/Argentina).
6. Hacé clic en **Create new project**. Esperá 1-2 minutos mientras
   Supabase lo prepara (vas a ver una pantalla de carga).

---

## PARTE 3 — Cargar la estructura de datos (las "migraciones")

Esto es literalmente pegar y ejecutar 8 bloques de texto, uno por uno.
Cada uno le dice a Supabase "creá esta tabla, con estas columnas". Sin
esto, la aplicación no tiene dónde guardar nada.

1. Con el proyecto de Supabase ya creado, en el menú de la izquierda
   buscá el ícono que dice **SQL Editor** y hacé clic.
2. Hacé clic en **New query** (o **+ New SQL Snippet**).
3. Ahora andá a la carpeta `salescloser-ai` que descomprimiste → entrá
   a `supabase` → `migrations`. Vas a ver 8 archivos que empiezan con
   números: `0001_...`, `0002_...`, hasta `0008_...`.
4. Abrí el primero (`0001_init.sql`) con un editor de texto simple:
   clic derecho → **Abrir con** → **Bloc de notas** (Windows) o
   **TextEdit** (Mac). *No lo abras haciendo doble clic sin más, podría
   intentar abrirlo con otro programa.*
5. Seleccioná todo el texto (Ctrl+A en Windows, Cmd+A en Mac) y copialo
   (Ctrl+C / Cmd+C).
6. Volvé a la pestaña de Supabase, pegá ese texto en el recuadro grande
   del SQL Editor (Ctrl+V / Cmd+V).
7. Hacé clic en el botón **Run** (o **RUN**, suele estar abajo a la
   derecha, o con Ctrl+Enter). Tiene que decir algo como "Success. No
   rows returned" — eso significa que funcionó.
8. Repetí los pasos 4 a 7 con `0002_conversation_analysis.sql`, después
   `0003_sales_coach.sql`, y así hasta `0008_pre_contact_strategy.sql`
   — **en ese orden, sin saltear ninguno**. Para cada uno: nueva query
   (paso 2), abrir el archivo, copiar, pegar, Run.

Si alguno te da un error en rojo, lo más probable es que te hayas
salteado uno anterior o hayas pegado el mismo dos veces — copiame el
mensaje de error exacto y lo resolvemos.

---

## PARTE 4 — Activar el login simple (para probar más rápido)

1. En el menú de la izquierda de Supabase, andá a **Authentication**.
2. Hacé clic en **Providers** (o **Sign In / Providers**).
3. Buscá **Email** en la lista y hacé clic para abrir sus opciones.
4. Buscá la opción **Confirm email** y **desactivala** (apagá el
   interruptor). Esto hace que cuando te registres en la aplicación no
   tengas que ir a confirmar por mail — queda activa al toque. (Podés
   volver a activarla más adelante si vas a usarla en serio con varias
   personas.)
5. Guardá el cambio si te lo pide (botón **Save**).

---

## PARTE 5 — Copiar las 3 claves de Supabase

1. En el menú de la izquierda, **Project Settings** (el ícono de
   engranaje, generalmente abajo del todo) → **API**.
2. Vas a ver varios campos. Copiá estos tres al Bloc de notas, cada uno
   con su etiqueta bien clara:
   - **Project URL** → pegalo como `SUPABASE_URL`
   - **anon public** (una clave larga) → pegalo como `SUPABASE_ANON_KEY`
   - **service_role** (otra clave larga, con un aviso de que es
     secreta) → pegalo como `SUPABASE_SERVICE_ROLE_KEY`

Estas tres las vamos a necesitar en la Parte 8. No se las muestres a
nadie ni las subas a ningún lado público.

---

## PARTE 6 — Crear la cuenta de Anthropic (la IA) y su clave

1. Andá a **[console.anthropic.com](https://console.anthropic.com)**.
2. Creá una cuenta (mail + contraseña, o con Google).
3. Te va a pedir verificar tu número de teléfono en algún momento —
   seguí los pasos que te indique.
4. Andá a **Settings** (o **Billing**) y cargá un método de pago
   (tarjeta de crédito/débito). Como hablamos antes, no tiene plan
   gratuito permanente — pero para el volumen que vas a usar al
   principio, el gasto es de pocos dólares.
5. Andá a **API Keys** en el menú de la izquierda → **Create Key**.
   Ponele un nombre (por ejemplo "salescloser-ai") → **Create Key**.
6. **Copiá la clave que te muestra AHORA MISMO** y pegala en tu Bloc de
   notas como `ANTHROPIC_API_KEY` — es la única vez que se muestra
   completa, si la perdés hay que crear una nueva.

---

## PARTE 7 — Subir el proyecto a GitHub (sin usar la terminal)

Acá vamos a usar una aplicación llamada **GitHub Desktop**, que tiene
botones para todo — no vas a tener que escribir ningún comando.

### 7.1. Crear la cuenta de GitHub

1. Andá a **[github.com](https://github.com)** → **Sign up**.
2. Completá mail, contraseña y nombre de usuario. Confirmá tu mail
   cuando te llegue el correo de verificación.

### 7.2. Instalar GitHub Desktop

1. Andá a **[desktop.github.com](https://desktop.github.com)**.
2. Hacé clic en **Download for Windows** (o para Mac, según tu
   computadora).
3. Abrí el instalador descargado y seguí los pasos (siguiente, siguiente,
   instalar) hasta que se abra la aplicación.
4. Cuando se abra, hacé clic en **Sign in to GitHub.com** e iniciá
   sesión con la cuenta que creaste en el paso 7.1.

### 7.3. Cargar el proyecto en GitHub Desktop

1. En el menú de arriba, **File → Add local repository...**
2. Hacé clic en **Choose...** y seleccioná la carpeta `salescloser-ai`
   que descomprimiste en la Parte 1 (la carpeta entera, no un archivo
   suelto de adentro).
3. Es muy probable que te aparezca un mensaje que dice algo como *"This
   directory does not appear to be a Git repository"* con un botón
   **create a repository**. Hacé clic ahí.
4. Te va a mostrar una pantalla para crear el repositorio: dejá los
   datos como están (o completá **Name** con `salescloser-ai` si está
   vacío) y hacé clic en **Create Repository**.

### 7.4. Subirlo a GitHub

1. Ahora vas a ver, en la parte de abajo a la izquierda, un campo para
   escribir un mensaje. Escribí algo como `Primera versión` y hacé clic
   en el botón azul **Commit to main**.
2. Arriba de todo vas a ver un botón que dice **Publish repository**
   (o **Push origin**, si ya lo habías publicado antes). Hacé clic ahí.
3. Te va a preguntar el nombre y si querés que sea privado (**Keep this
   code private**) — te recomiendo dejarlo **tildado** (privado), así
   nadie más puede ver tu código. Hacé clic en **Publish Repository**.
4. Esperá a que termine de subir (la barra de progreso desaparece
   cuando termina). Con eso, tu código ya está en GitHub.

---

## PARTE 8 — Crear la cuenta en Vercel y publicar la aplicación

1. Andá a **[vercel.com](https://vercel.com)** → **Sign Up**.
2. Elegí **Continue with GitHub** — así queda conectado directamente
   con la cuenta que creaste en la Parte 7.
3. Una vez adentro, hacé clic en **Add New...** → **Project**.
4. Vas a ver una lista de tus repositorios de GitHub — buscá
   `salescloser-ai` y hacé clic en **Import**.
5. Vercel va a reconocer solo que es un proyecto Next.js — **no toques
   nada** de la sección "Build and Output Settings".
6. Antes de hacer clic en Deploy, buscá la sección **Environment
   Variables** (variables de entorno — son los "datos secretos" que la
   aplicación necesita para funcionar, como las claves que fuiste
   guardando). Agregá, una por una, escribiendo el **nombre exacto** a
   la izquierda y pegando el **valor** que tenés guardado a la derecha:

   | Nombre (escribilo tal cual) | Valor (pegalo de tu Bloc de notas) |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | lo que guardaste como `SUPABASE_URL` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | lo que guardaste como `SUPABASE_ANON_KEY` |
   | `SUPABASE_SERVICE_ROLE_KEY` | lo que guardaste como `SUPABASE_SERVICE_ROLE_KEY` |
   | `ANTHROPIC_API_KEY` | lo que guardaste como `ANTHROPIC_API_KEY` |
   | `NEXT_PUBLIC_APP_URL` | dejala vacía por ahora, la completamos en la Parte 9 |

   Después de cada una, hacé clic en **Add** antes de pasar a la
   siguiente.
7. Cuando tengas las 5 cargadas, hacé clic en el botón grande **Deploy**.
8. Esperá — vas a ver una pantalla con el progreso. La primera vez
   tarda entre 2 y 5 minutos. Cuando termina, te muestra un mensaje de
   éxito con una imagen de la aplicación.

---

## PARTE 9 — Probar que todo funciona

1. En Vercel, hacé clic en el botón que dice **Visit** (o copiá la URL
   que te muestra arriba, algo como
   `salescloser-ai-tuusuario.vercel.app`).
2. Se te tiene que abrir el navegador y redirigirte solo a una pantalla
   de **login**.
3. Hacé clic en **Registrate**, poné cualquier mail y una contraseña
   (inventala, es para vos) → **Crear cuenta**.
4. Deberías entrar directo al **Dashboard**.
5. En el menú de la izquierda, andá a **Clientes → Nuevo cliente**.
6. Completá el nombre, y en el campo grande **"Conversación completa"**
   pegá una conversación de prueba (puede ser inventada, para probar).
7. Hacé clic en **Crear cliente**.
8. Entrá a la ficha de ese cliente (aparece en el listado) y esperá
   unos 10-20 segundos. Deberían empezar a aparecer las tarjetas de
   análisis completas.

**Si llegaste hasta acá y funciona: la aplicación ya está online y
lista para usar.** El paso opcional que queda es volver a Vercel →
tu proyecto → **Settings → Environment Variables** y completar
`NEXT_PUBLIC_APP_URL` con la URL real que te asignó (no es
imprescindible para que funcione, pero es prolijo tenerla).

---

## PARTE 10 — Si algo no funciona

**La página no carga / da un error al abrir la URL de Vercel**
→ Volvé a Vercel, entrá al proyecto, pestaña **Deployments**, fijate si
el último deploy tiene una tilde verde o una cruz roja. Si es roja,
hacé clic ahí, después en **Build Logs**, y copiame el texto del error.

**Me registro pero no me deja crear un cliente / dice "Error"**
→ Revisá que las 5 variables de entorno estén bien cargadas en Vercel
(sección **Settings → Environment Variables** del proyecto), sin
espacios de más al principio o al final de cada valor. Si corregís
algo ahí, tenés que ir a **Deployments** y hacer **Redeploy** para que
el cambio se aplique.

**Creo el cliente pero las tarjetas de análisis quedan vacías**
→ Lo más probable es la clave de Anthropic: revisá que
`ANTHROPIC_API_KEY` esté bien pegada (sin espacios) y que la cuenta de
Anthropic tenga saldo cargado. Probá el botón **"Re-analizar"** en la
ficha del cliente.

**No sé en qué paso me quedé o algo se ve distinto a lo que describe la guía**
→ Contame en qué pantalla estás (o mandame una captura) y seguimos
desde ahí — no hace falta que vuelvas a empezar de cero.

---

## PARTE 11 — Guardá esto en un lugar seguro

Al terminar, deberías tener anotados en tu Bloc de notas (o mejor, en
un gestor de contraseñas):

- Usuario y contraseña de Supabase, GitHub, Vercel y Anthropic.
- Las 3 claves de Supabase y la clave de Anthropic.
- El usuario y contraseña que creaste dentro de la aplicación
  (Registrate) — ese es el que vas a usar todos los días para entrar.
- La URL final de la aplicación.

No hace falta que me las compartas a mí — son tuyas, guardalas donde
vos accedas fácil.
