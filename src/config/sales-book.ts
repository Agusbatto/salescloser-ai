export interface BookSection {
  id: string;
  title: string;
  body: string[]; // cada string es un párrafo o un bloque (puede tener \n para listas)
}

export const BOOK_SECTIONS: BookSection[] = [
  {
    id: "preguntas",
    title: "Preguntas abiertas y cerradas",
    body: [
      "Una pregunta cerrada se responde con una palabra (\"sí\", \"no\", un número, una fecha). Sirven para confirmar datos puntuales — cuántos pasajeros son, si ya tienen pasaporte vigente — pero usadas de más, la conversación se siente un interrogatorio y el cliente se cierra.",
      "Una pregunta abierta obliga a elaborar una respuesta (\"¿qué es lo que más buscan en este viaje?\", \"¿cómo se imaginan esas vacaciones?\"). Son las que realmente revelan motivaciones, presupuesto real y objeciones que el cliente todavía no dijo en voz alta.",
      "Regla práctica para una primera consulta: arrancá con 2-3 preguntas abiertas para entender el deseo detrás del viaje, y usá las cerradas después, para cerrar los datos concretos que ya sabés que necesitás (fechas, cantidad de pasajeros, presupuesto aproximado).",
      "Ejemplo de secuencia:\n1. Abierta: \"¿Qué los motiva a hacer este viaje?\" (cumpleaños, luna de miel, desconexión del trabajo)\n2. Abierta: \"¿Qué tipo de experiencia buscan — más relax, más aventura, más cultural?\"\n3. Cerrada: \"¿Tienen fechas cerradas o hay flexibilidad?\"\n4. Cerrada: \"¿Cuántos son, y hay menores?\"",
    ],
  },
  {
    id: "spin",
    title: "SPIN Selling (Neil Rackham)",
    body: [
      "SPIN es una secuencia de 4 tipos de pregunta, pensada para ventas donde el cliente no siempre sabe que tiene un problema hasta que se lo hacés ver.",
      "Situación: preguntas de contexto (¿a dónde viajan habitualmente?, ¿con quién viajan?). Poca de más — es la parte menos valiosa, solo para ubicarte.",
      "Problema: preguntas que sacan a la luz una dificultad (¿qué fue lo que no les gustó del último viaje?, ¿qué les complicó organizar solos un viaje así?).",
      "Implicación: preguntas que agrandan esa dificultad para que se sienta el costo de no resolverla (¿qué pasaría si llegan sin el seguro y hay una urgencia médica?, ¿cómo los afectaría no tener el traslado coordinado con vuelos que cambian de horario?). Esta es la pregunta que más vende — sin presionar, el cliente llega solo a la conclusión de que necesita resolverlo.",
      "Necesidad de solución: preguntas que hacen que el cliente diga en voz alta el valor de la solución (¿les serviría tener todo coordinado por una sola agencia, sin tener que estar pendientes de nada?). Cuando el cliente lo dice él mismo, se vende solo — no hace falta que se lo digas vos.",
    ],
  },
  {
    id: "aida",
    title: "AIDA (Atención, Interés, Deseo, Acción)",
    body: [
      "Un esquema clásico para estructurar un mensaje de venta, útil sobre todo en el primer contacto o en una propuesta escrita.",
      "Atención: lo primero que lee el cliente tiene que engancharlo (un dato concreto del destino, no un genérico \"tenemos una propuesta para usted\").",
      "Interés: desarrollás por qué esto le importa a este cliente puntual (no una lista de características del hotel, sino por qué esas características resuelven lo que él te dijo que buscaba).",
      "Deseo: lo ayudás a imaginarse viviendo la experiencia (\"imaginate la primera mañana desayunando frente al mar...\").",
      "Acción: un cierre claro y concreto — no \"avisame cualquier cosa\", sino \"¿te reservo esa opción antes de que se agote?\" o una pregunta puntual que dispare la respuesta.",
    ],
  },
  {
    id: "bant",
    title: "BANT (Budget, Authority, Need, Timing)",
    body: [
      "Un checklist de calificación de leads, útil para decidir cuánto esfuerzo ponerle a cada consulta: Presupuesto (¿tiene con qué pagarlo?), Autoridad (¿es quien decide, o tiene que consultarlo con alguien más — pareja, padres?), Necesidad (¿el viaje resuelve algo real para él?) y Timing (¿tiene urgencia real de fechas, o está mirando sin apuro?).",
      "No es una secuencia de preguntas textuales para el cliente — es una grilla mental tuya, para priorizar a quién llamar primero y a quién simplemente mandarle información y esperar.",
    ],
  },
  {
    id: "challenger",
    title: "Challenger Sale (Matthew Dixon y Brent Adamson)",
    body: [
      "La idea central: los mejores vendedores no son los que más simpatía generan, son los que le enseñan algo nuevo al cliente sobre su propia situación — un dato, una perspectiva que no tenía — y después lo desafían constructivamente a actuar.",
      "En una agencia de viajes esto se traduce en: no preguntarle solo qué quiere el cliente, sino aportarle información que él no tenía (\"esa fecha que estás mirando coincide con temporada alta en esa zona, los precios suelen subir un 30% en las próximas dos semanas\") y después guiarlo hacia una decisión concreta con esa información nueva.",
      "El riesgo de esta técnica es sonar sabelotodo — funciona cuando el dato es genuinamente útil para el cliente, no cuando es una excusa para presionar.",
    ],
  },
  {
    id: "sandler",
    title: "Sandler Selling System (David Sandler)",
    body: [
      "El principio central de Sandler es invertir el desequilibrio de poder típico de una venta: en vez de perseguir al cliente, dejás que sea él quien tenga que \"ganarse\" tu ayuda — hablando de sus problemas reales, su presupuesto real, y comprometiéndose con pasos concretos.",
      "Una herramienta clave es el \"contrato inicial\": antes de avanzar con una propuesta larga, acordás explícitamente con el cliente qué va a pasar (\"te armo dos opciones con estos datos, y si alguna te sirve, avanzamos con la reserva esta semana — ¿tiene sentido?\"). Esto evita el clásico \"te mando la cotización y desaparece\".",
      "Sandler también trabaja mucho la objeción del precio con preguntas, no con descuentos: en vez de bajar el precio apenas objetan, preguntás \"¿comparado con qué te parece caro?\" o \"¿qué presupuesto tenías en mente?\" — la objeción casi siempre esconde otra cosa (no entendió el valor, está comparando con algo distinto, o directamente no tiene el dinero y hay que ofrecer otra opción, no un descuento).",
    ],
  },
  {
    id: "chrisvoss",
    title: "Chris Voss — negociación táctica (ex negociador del FBI)",
    body: [
      "Escucha activa táctica: repetir las últimas 2-3 palabras que dijo el cliente, como pregunta (\"...¿el presupuesto?\"). Suena simple pero hace que la persona elabore más y se sienta escuchada, sin que vos tengas que argumentar nada todavía.",
      "Etiquetado (\"labeling\"): nombrar la emoción que percibís, sin asumir que tenés razón (\"Parece que te preocupa el tema de las fechas\" en vez de preguntar directamente \"¿te preocupan las fechas?\"). Bajar la guardia emocional del otro antes de negociar el dato concreto.",
      "Preguntas calibradas: en vez de pedir algo directamente, hacé que el otro resuelva tu problema con una pregunta abierta (\"¿cómo hago yo para sostener este precio si me pedís que le sume el traslado gratis?\" en vez de \"no puedo hacer eso\"). Esto involucra al cliente en encontrar la solución, en vez de que sea un choque de posiciones.",
      "El \"no\" como punto de partida, no de cierre: para Voss, un \"no\" inicial da seguridad al otro (siente que tiene el control) y en realidad abre la negociación real, en vez de forzar un \"sí\" prematuro que después se cae.",
    ],
  },
  {
    id: "belfort",
    title: "Jordan Belfort — Straight Line System",
    body: [
      "El sistema plantea que toda venta se mueve en una \"línea recta\" desde el saludo hasta el cierre, y que el vendedor tiene que ir removiendo, en cada tramo, las tres barreras que hacen que el cliente se desvíe: falta de confianza en el producto, falta de confianza en la agencia/vendedor, y falta de confianza en sí mismo (miedo a decidir mal).",
      "Belfort insiste mucho en el tono y el ritmo de la voz como herramienta (transmitir certeza sin sonar agresivo) y en calificar rápido si el cliente tiene, además de deseo, la capacidad real de compra — para no invertir horas en una propuesta que nunca se va a cerrar.",
      "Es la metodología más asociada a la urgencia y el cierre directo — funciona bien combinada con Sandler o Voss para no volverse solo presión sin sustento (la línea recta sin genuino valor detrás se nota, y en el rubro de viajes, donde hay recompra y referidos, la reputación importa más que un cierre forzado puntual).",
    ],
  },
  {
    id: "cardone",
    title: "Grant Cardone — 10X",
    body: [
      "La idea del 10X es simple: la mayoría subestima el esfuerzo y el volumen de acción necesarios para lograr un objetivo, y por eso apunta 10 veces más alto de lo que parece razonable — en volumen de contactos, en seguimiento, en no dar por perdido un lead antes de tiempo.",
      "Aplicado a una agencia: no asumir que un cliente que no respondió en 3 días perdió el interés — la mayoría de las ventas se cierran después de varios seguimientos, no en el primer contacto. Cardone es la base filosófica de por qué el módulo de seguimiento de esta app nunca da un cliente por perdido solo, hasta que vos lo marcás así.",
      "También enfatiza la urgencia genuina (no inventada): fechas límite reales de tarifas, disponibilidad real de cupos — comunicadas con claridad, no como truco de presión artificial.",
    ],
  },
  {
    id: "tracy",
    title: "Brian Tracy",
    body: [
      "Tracy insiste en la preparación previa a cada contacto: cuanto más sabés del cliente antes de hablarle, más rápido generás confianza — de ahí la lógica del módulo \"Antes del primer contacto\" de esta app, que arma una estrategia con lo poco o mucho que ya sabés antes de escribirle.",
      "Otro pilar suyo es vender beneficios, no características: no \"el hotel tiene pileta climatizada\", sino \"van a poder nadar tranquilos aunque el clima esté fresco, sin que el chico se aburra en el cuarto\" — la característica traducida al beneficio concreto para esa familia puntual.",
      "También plantea la \"regla del 80/20\" aplicada a la cartera de clientes: identificar qué 20% de tus consultas tiene 80% de probabilidad real de cerrar, y priorizar el tiempo ahí — la misma lógica del ranking por prioridad del Dashboard.",
    ],
  },
  {
    id: "cialdini",
    title: "Robert Cialdini — los 6 principios de persuasión",
    body: [
      "Reciprocidad: cuando das algo primero (un dato útil, un tip del destino, una atención genuina), la otra persona siente el impulso natural de devolver algo — en ventas, eso suele traducirse en más apertura a escuchar tu propuesta.",
      "Compromiso y coherencia: una vez que alguien se compromete con algo chico (\"¿te interesaría que te arme una propuesta?\"), es más consistente sostener ese compromiso en los pasos siguientes — de ahí la utilidad del \"contrato inicial\" de Sandler.",
      "Prueba social: mostrar que otros clientes similares ya viajaron y quedaron conformes reduce la incertidumbre de decidir (reseñas, casos parecidos, \"la semana pasada armamos algo así para una familia con la misma cantidad de chicos\").",
      "Simpatía: la gente compra más fácil a quien le cae bien y siente que se parece a ella — encontrar puntos en común genuinos (no forzados) ayuda más que cualquier técnica de cierre.",
      "Autoridad: mostrar conocimiento real del destino y del rubro (no solo repetir folletería) construye la sensación de que estás asesorando, no solo vendiendo.",
      "Escasez: la disponibilidad limitada (cupos, tarifas por tiempo limitado) aumenta el valor percibido — pero solo funciona, y solo debería usarse, cuando es genuina. Escasez inventada se nota y quema la confianza a mediano plazo.",
    ],
  },
  {
    id: "cierre",
    title: "Técnicas de cierre — resumen práctico",
    body: [
      "Cierre de alternativa: en vez de preguntar \"¿lo confirmamos?\" (que invita a un no), preguntás \"¿preferís la opción con desayuno incluido, o la más económica sin él?\" — ambas respuestas cierran la venta, solo cambia el detalle.",
      "Cierre por urgencia genuina: comunicar una fecha límite real (tarifa promocional, disponibilidad de cupos) sin exagerarla ni inventarla.",
      "Cierre de resumen: antes de pedir la confirmación, resumís en voz alta todo lo acordado (\"entonces quedamos en 7 noches, all-inclusive, saliendo el 14, con el traslado incluido\") — la repetición genera la sensación de que ya está todo decidido, falta solo confirmar.",
      "Cierre por objeción resuelta: cuando el cliente plantea una objeción puntual y se la resolvés con un dato concreto, la pregunta natural que sigue es \"entonces, ¿avanzamos?\" — no dejes pasar ese momento sin pedir el cierre.",
      "Regla general en las cinco: ninguna reemplaza el valor real de la propuesta. Son formas de no dejar pasar el momento en que el cliente ya está listo para decidir — no formas de convencer a alguien que genuinamente no quiere o no puede comprar.",
    ],
  },
];
