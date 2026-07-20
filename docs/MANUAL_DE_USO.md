# Manual de uso — SalesCloser AI

Guía para el día a día: cómo cargar un cliente, qué hace la IA
automáticamente y cómo leer cada parte de la ficha.

---

## 1. Qué es

SalesCloser AI es un CRM pensado para agencias de viajes. La diferencia
con un CRM tradicional: cada vez que pegás la conversación con un
cliente, la aplicación la lee y arma automáticamente seis análisis
distintos — vos no completás nada a mano, solo pegás el texto y guardás.

---

## 2. Ingresar

Entrá a la URL de la aplicación. Si es tu primera vez, tocá
**Registrate** y creá tu cuenta con email y contraseña. Las próximas
veces, **Iniciar sesión** con esos mismos datos. Para salir, usá
**Cerrar sesión** abajo del menú lateral.

Importante: cada cuenta ve solo sus propios clientes, no los de otros
vendedores.

---

## 3. Cargar un cliente nuevo

**Clientes → Nuevo cliente.** Los campos:

| Campo | Para qué sirve |
|---|---|
| Nombre * | Único campo obligatorio |
| Empresa | Opcional |
| Teléfono / Correo | Datos de contacto |
| Producto consultado | Ej. "Luna de miel Punta Cana" |
| Origen del lead | De dónde vino la consulta |
| Estado | Nuevo / Contactado / En negociación / Ganado / Perdido |
| Fecha del último contacto | Se usa para calcular si el seguimiento está atrasado |
| Notas | Texto libre para vos |
| **Conversación completa** | Acá pegás el chat entero con el cliente |
| Etiquetas | Si ya creaste alguna, la podés marcar acá |

Apenas guardás con **Crear cliente**, dos cosas pasan solas:

1. Se genera automáticamente una **estrategia para el primer contacto**
   (cómo encararlo, qué preguntar y en qué orden) — esto pasa aunque
   todavía no hayas pegado ninguna conversación.
2. Si sí pegaste una conversación, se disparan en paralelo los otros
   cinco análisis (ver sección 5).

No hace falta pegar la conversación en el momento de crear el cliente
— podés cargarlo solo con el nombre y volver más tarde a editarlo
cuando tengas el chat.

---

## 4. Pegar o actualizar la conversación

Entrá a la ficha del cliente → **Editar** → pegá o actualizá el texto
en "Conversación completa" → **Guardar cambios**.

- Si el texto cambió respecto al que ya estaba guardado, se vuelve a
  correr todo el análisis automáticamente.
- Si no cambió nada, no se gasta un análisis de más — el sistema
  compara antes de disparar la IA.
- Para forzar un análisis nuevo sin tocar el texto (por ejemplo, pasó
  tiempo y querés un seguimiento actualizado), usá el botón
  **"Re-analizar"** arriba de todo en la ficha.

Recomendación: pegá la conversación **completa**, no un resumen tuyo —
cuanto más contexto real tenga, mejor calidad tienen todos los
análisis (sobre todo las objeciones y las emociones detectadas).

---

## 5. Qué hace cada parte de la ficha del cliente

### Antes del primer contacto
Se genera al crear el cliente, sin necesitar conversación. Te dice cómo
encarar la consulta, el objetivo del primer mensaje, el tono
recomendado y qué preguntar (en orden, con el motivo de cada pregunta).
Tiene su propio botón **"Regenerar"** si cambiaste los datos iniciales
del cliente antes de escribirle.

### Sales Intelligence — diagnóstico ejecutivo
La card más importante: un resumen de 6 líneas de toda la conversación,
más etapa comercial, temperatura, probabilidad de cierre, riesgo de
abandono, confianza del cliente, urgencia, presupuesto detectado,
objeciones, emociones, próxima acción recomendada y la mejor técnica de
venta para el momento. Pensada para leer de un vistazo antes de entrar
al chat completo.

### Puntaje del lead (0-100)
Un número con explicación factor por factor (▲ suma, ▼ resta, ● no
influye) — nunca es solo el número solo.

### Seguimiento sugerido
Te dice si el cliente está **atrasado** de respuesta (esto se calcula
al momento, siempre está actualizado, aunque no vuelvas a analizar
nada) y, si corresponde, un mensaje listo para mandarle que nunca
repite lo que ya le dijiste antes.

### Línea de tiempo
Un historial automático de hitos: consulta recibida, cotización
enviada, objeción detectada, seguimiento realizado, cliente respondió,
venta cerrada/perdida. No cargás nada a mano acá.

### Ficha resumen del viaje
Los datos concretos del viaje (destino, pasajeros, presupuesto, hotel,
fechas, etc.) con un checklist de qué falta todavía.

### Diagnóstico de venta
El análisis con las 10 metodologías de venta (SPIN, AIDA, BANT,
Challenger, Sandler, Chris Voss, Belfort, Cardone, Tracy, Cialdini) y
3 respuestas sugeridas, cada una con la técnica en la que se basa.

---

## 6. Dashboard y ranking comercial

**Dashboard** te muestra el pipeline completo (cuántos clientes en cada
estado) y un **ranking** de clientes ordenado automáticamente por
probabilidad de cierre — los que tenés más chances de cerrar aparecen
primero. Los clientes en estado Ganado o Perdido nunca aparecen en el
ranking (ya no son pipeline activo).

Filtros disponibles arriba del ranking: estado, temperatura, etiqueta y
rango de probabilidad de cierre (mín./máx. %).

---

## 7. Buscador, filtros y etiquetas

En **Clientes**, el buscador filtra por nombre, empresa, email o
teléfono. Los filtros de estado/origen/etiqueta van por arriba de la
tabla. Las etiquetas de color se crean y asignan desde la misma
pantalla — abajo del listado hay un gestor para crear una nueva con su
color.

---

## 8. Editar y eliminar

Desde la ficha del cliente: **Editar** para modificar cualquier campo,
**Eliminar** para borrarlo (pide confirmación, no se puede deshacer —
también borra su línea de tiempo).

---

## 9. Buenas prácticas recomendadas

- Pegá la conversación completa, no un resumen armado por vos.
- Mirá primero el resumen ejecutivo de Sales Intelligence antes de leer
  el chat entero — para eso está.
- Los datos "detectados" por la IA (presupuesto, fechas, objeciones)
  son una ayuda, no una fuente de verdad legal — antes de comunicarle
  algo sensible a un cliente (por ejemplo, requisitos de visa cuando se
  implemente el módulo de destinos), verificalo vos.
- Usá "Re-analizar" después de una pausa larga sin conversación nueva,
  para que el seguimiento sugerido y el puntaje reflejen el paso del
  tiempo.

---

## 10. Preguntas frecuentes

**¿Por qué no aparece ningún análisis después de guardar?**
Puede tardar unos segundos. Si después de un minuto sigue vacío, probá
"Re-analizar". Si tampoco funciona, puede ser un problema de
configuración (créditos de la API agotados, por ejemplo) — consultá el
manual de instalación, sección "Si los análisis no aparecen".

**¿Puedo ver los clientes de otro vendedor?**
No, por ahora cada cuenta ve solo lo suyo.

**¿Se pierde algo si edito la conversación por error?**
El texto anterior se reemplaza — no hay historial de versiones de la
conversación. La línea de tiempo sí queda, esa no se borra al editar.

**¿Qué pasa si pego la misma conversación dos veces sin cambios?**
No se gasta un análisis de más — el sistema detecta que no cambió y no
vuelve a llamar a la IA.
