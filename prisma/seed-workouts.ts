import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Catálogo de Ejercicios Adaptados para Casa (Mancuernas + Peso Corporal)
const exercisesData = [
  // --- TREN SUPERIOR / PECHO / HOMBROS / TRÍCEPS ---
  {
    slug: "press-pecho-piso-mancuernas",
    name: "Press de Pecho en Suelo con Mancuernas",
    muscleGroup: "Pecho y Tríceps",
    equipment: "Kit de Mancuernas + Esterilla",
    instructions:
      "1. Acuéstate boca arriba en la colchoneta con las rodillas flexionadas y los pies firmes en el piso.\n2. Sujeta las mancuernas a la altura del pecho con los codos a unos 45-60 grados del torso (no abiertos a 90°).\n3. Empuja las mancuernas hacia arriba con control, exhalando, hasta extender casi por completo los brazos.\n4. Desciende lentamente inhalando hasta que los tríceps toquen suavemente el suelo.",
    commonMistakes:
      "Rebotar los codos bruscamente contra el piso o arquear la zona lumbar en exceso.",
    alternative: "Flexiones de pecho apoyadas en pared o sofá elevado.",
    safetyWarning:
      "Mantén respiración rítmica y continua. Evita aguantar el aire en el esfuerzo máximo.",
  },
  {
    slug: "press-militar-sentado-mancuernas",
    name: "Press Militar de Hombro Sentado",
    muscleGroup: "Hombros y Tríceps",
    equipment: "Kit de Mancuernas + Silla firme",
    instructions:
      "1. Siéntate erguido en una silla con la espalda apoyada y los pies bien apoyados en el suelo.\n2. Sube las mancuernas a la altura de las orejas con palmas hacia el frente o semi-neutras.\n3. Empuja verticalmente hacia arriba sin bloquear agresivamente los codos al final.\n4. Baja controlando la carga en 2-3 segundos.",
    commonMistakes:
      "Inclinar la cabeza hacia adelante o arquear la espalda baja perdiendo el contacto con el respaldo.",
    alternative: "Elevaciones frontales ligeras con mancuerna o un solo disco compartido.",
    safetyWarning:
      "Exhala al empujar hacia arriba e inhala al descender. Mantén la tensión controlada.",
  },
  {
    slug: "elevaciones-laterales-mancuernas",
    name: "Elevaciones Laterales de Hombro",
    muscleGroup: "Hombros (Deltoides lateral)",
    equipment: "Kit de Mancuernas ligeras",
    instructions:
      "1. De pie o sentado con el torso firme y ligero ángulo hacia adelante.\n2. Sujeta mancuernas ligeras a los costados.\n3. Eleva los brazos hacia los lados con los codos ligeramente flexionados hasta la altura de los hombros.\n4. Realiza una pausa de 1 segundo arriba y baja despacio.",
    commonMistakes:
      "Impulsarse con balanceo del cuerpo o subir las mancuernas por encima del nivel del hombro.",
    alternative: "Elevaciones laterales unilaterales sujetándose de una pared.",
    safetyWarning: "No utilices cargas pesadas; este movimiento premia la técnica estricta.",
  },
  {
    slug: "extension-triceps-tras-nuca",
    name: "Extensión de Tríceps Copa (Sentado)",
    muscleGroup: "Tríceps",
    equipment: "1 Mancuerna individual",
    instructions:
      "1. Siéntate con la espalda recta y sujeta una sola mancuerna verticalmente con ambas manos detrás de la cabeza.\n2. Mantén los codos apuntando hacia arriba y cercanos a las orejas.\n3. Extiende los antebrazos hacia arriba activando los tríceps.\n4. Desciende con suavidad sintiendo el estiramiento del tríceps.",
    commonMistakes: "Abrir excesivamente los codos hacia afuera o curvar la columna cervical.",
    alternative: "Fondos de tríceps suaves con manos en borde de silla y pies cerca.",
    safetyWarning: "Asegura bien el agarre de la mancuerna antes de iniciar el movimiento.",
  },
  {
    slug: "flexiones-inclinadas-sofa",
    name: "Flexiones Inclinadas en Sofá o Banco",
    muscleGroup: "Pecho, Tríceps y Core",
    equipment: "Peso corporal + Sofá / Mesa baja estable",
    instructions:
      "1. Coloca las manos en el borde firme de un sofá o banco a una distancia ligeramente mayor que el ancho de hombros.\n2. Forma una línea recta con tu cuerpo desde la cabeza hasta los talones.\n3. Desciende el pecho hacia el borde doblando los codos a 45 grados.\n4. Empuja el borde con fuerza para volver a la posición inicial manteniendo el abdomen apretado.",
    commonMistakes: "Dejar caer la cadera hacia abajo o empujar solo con el cuello.",
    alternative: "Flexiones de pie contra la pared.",
    safetyWarning: "No fuerces las muñecas; mantén los antebrazos alineados.",
  },

  // --- ESPALDA Y BÍCEPS ---
  {
    slug: "remo-unilateral-mancuerna",
    name: "Remo Unilateral con Mancuerna",
    muscleGroup: "Espalda (Dorsal) y Bíceps",
    equipment: "Kit de Mancuernas + Silla o Sofá",
    instructions:
      "1. Apoya una mano y rodilla sobre un asiento firme o mantén postura inclinada con soporte.\n2. Con la otra mano, sujeta una mancuerna con el brazo extendido.\n3. Tracciona la mancuerna hacia tu cadera, llevando el codo pegado al torso hacia atrás.\n4. Contrae la espalda 1 segundo y desciende de forma controlada.",
    commonMistakes: "Rotar violentamente el torso o tirar solo con la fuerza del brazo.",
    alternative: "Remo con mancuernas con ambos brazos inclinado apoyando el pecho en cojines.",
    safetyWarning: "Mantén la columna neutra y el cuello relajado en línea con la columna.",
  },
  {
    slug: "remo-dos-brazos-conector",
    name: "Remo con Barra Conectora",
    muscleGroup: "Espalda alta y media",
    equipment: "Mancuernas con Barra Conectora montada",
    instructions:
      "1. Con las dos mancuernas unidas con la barra conectora, inclina el torso a 45 grados con las caderas hacia atrás.\n2. Sujeta la barra con agarre prono o neutro.\n3. Lleva la barra hacia el ombligo apretando las escápulas atrás.\n4. Desciende con control extendiendo los dorsales.",
    commonMistakes: "Redondear la espalda baja o levantarse al jalar la barra.",
    alternative: "Remo bilateral con mancuernas independientes.",
    safetyWarning: "Mantén una ligera flexión en las rodillas para proteger la zona lumbar.",
  },
  {
    slug: "curl-biceps-martillo",
    name: "Curl de Bíceps Tipo Martillo",
    muscleGroup: "Bíceps y Antebrazos (Braquial)",
    equipment: "Kit de Mancuernas",
    instructions:
      "1. De pie o sentado erguido, sujeta las mancuernas con las palmas mirándose entre sí (agarre neutro).\n2. Sin mover los codos de los costados, flexiona los brazos llevando las mancuernas hacia los hombros.\n3. Aprieta el bíceps arriba y baja lentamente en 2 segundos.",
    commonMistakes: "Balancear el cuerpo para subir el peso o despegar los codos del torso.",
    alternative: "Curl de bíceps concentrado sentado apoyando el codo en el muslo.",
    safetyWarning: "Movimiento controlado en todo el rango sin tirones articulares.",
  },

  // --- GLÚTEOS Y CADENA POSTERIOR (RODILLA SEGURA — ESPECIAL ELLA) ---
  {
    slug: "puente-gluteos-suelo",
    name: "Puente de Glúteos en Suelo",
    muscleGroup: "Glúteos e Isquiotibiales",
    equipment: "Peso corporal o Mancuerna sobre cadera",
    instructions:
      "1. Acuéstate boca arriba en la colchoneta con las rodillas dobladas a 90° y los pies firmemente apoyados en el suelo al ancho de caderas.\n2. Empuja con fuerza a través de los talones elevando la pelvis hasta que el cuerpo forme una línea recta desde hombros a rodillas.\n3. Aprieta con máxima intención los glúteos arriba durante 2 segundos.\n4. Desciende lentamente sin que la pelvis toque totalmente el suelo entre repeticiones.",
    commonMistakes:
      "Arquear la espalda baja en lugar de apretar los glúteos, o colocar los pies demasiado lejos.",
    alternative: "Puente de glúteos con una sola pierna (versión suave sin carga).",
    safetyWarning:
      "Cero impacto en rodillas. El empuje debe provenir de los talones y la contracción de los glúteos.",
  },
  {
    slug: "hip-thrust-sofa-mancuerna",
    name: "Hip Thrust con Apoyo en Sofá / Banco",
    muscleGroup: "Glúteo Mayor y Cadena Posterior",
    equipment: "Kit de Mancuernas (opcional) + Sofá o Banco",
    instructions:
      "1. Apoya la parte media/superior de la espalda en el borde acolchado de un sofá o banco.\n2. Coloca una mancuerna (opcional) sobre la pelvis sujetándola con las manos.\n3. Con los pies firmes y rodillas a 90° al subir, extiende la cadera hacia arriba apretando los glúteos con fuerza.\n4. Mantén la barbilla recogida mirando al frente durante todo el recorrido.\n5. Pausa de 2 segundos en la cima y desciende suavemente.",
    commonMistakes: "Hiper-extender la zona lumbar en la cima o desalinear las rodillas hacia adentro.",
    alternative: "Puente de glúteos en suelo con mayor número de repeticiones.",
    safetyWarning:
      "Muy seguro para rodilla derecha al no haber flexión cerrada ni impacto. Controla la bajada.",
  },
  {
    slug: "peso-muerto-rumano-mancuernas",
    name: "Peso Muerto Rumano con Mancuernas",
    muscleGroup: "Isquiotibiales y Glúteos (Cadena posterior)",
    equipment: "Kit de Mancuernas",
    instructions:
      "1. De pie con los pies al ancho de hombros y rodillas ligeramente desbloqueadas (micro-flexión fija).\n2. Sujeta las mancuernas frente a los muslos.\n3. Empuja las caderas hacia atrás como si quisieras tocar la pared detrás de ti, bajando las mancuernas pegadas a las piernas.\n4. Baja solo hasta sentir un buen estiramiento en la parte posterior del muslo (justo debajo de las rodillas).\n5. Regresa empujando las caderas hacia adelante y contrayendo glúteos.",
    commonMistakes:
      "Doblar las rodillas como en una sentadilla o curvar la espalda baja hacia adelante.",
    alternative: "Buenos días con peso corporal y manos en la nuca.",
    safetyWarning:
      "La flexión de rodilla es mínima y fija (bisagra de cadera pura). Excelente para proteger la rodilla derecha.",
  },
  {
    slug: "patada-gluteo-cuadrupedia",
    name: "Patada de Glúteo en Cuadrupedía",
    muscleGroup: "Glúteos (Aislamiento)",
    equipment: "Peso corporal + Colchoneta",
    instructions:
      "1. Colócate en cuatro apoyos (manos bajo hombros, rodillas bajo caderas sobre colchoneta acolchada).\n2. Manteniendo la rodilla flexionada a 90°, eleva una pierna hacia atrás y hacia el techo hasta que el muslo quede alineado con el torso.\n3. Aprieta el glúteo en la parte superior durante 1 segundo sin rotar la cadera.\n4. Baja de forma controlada sin tocar el suelo y repite.",
    commonMistakes: "Arquear la zona lumbar para subir más la pierna o torcer la pelvis hacia los lados.",
    alternative: "Puente de glúteos con énfasis en una pierna.",
    safetyWarning:
      "Coloca una toalla o cojín bajo la rodilla derecha de apoyo para máximo confort articular.",
  },
  {
    slug: "abduccion-cadera-lateral-suelo",
    name: "Abducción de Cadera Tumbada de Lado",
    muscleGroup: "Glúteo Medio y Menor (Estabilidad pélvica)",
    equipment: "Peso corporal + Esterilla",
    instructions:
      "1. Acuéstate sobre tu costado izquierdo con el cuerpo alineado y la cabeza apoyada en el brazo.\n2. Mantén la pierna derecha recta con la punta del pie mirando ligeramente hacia el suelo.\n3. Eleva la pierna derecha hacia arriba unos 30-40 grados de forma lenta y controlada.\n4. Sostén 1 segundo sintiendo el lateral del glúteo y desciende con control.",
    commonMistakes: "Girar la cadera hacia atrás abriendo la pelvis hacia el techo.",
    alternative: "Monster walk suave o clam shell lateral.",
    safetyWarning:
      "Excelente para fortalecer la estabilidad de la pelvis y proteger la rodilla sin impacto.",
  },
  {
    slug: "curl-femoral-tumbada-mancuerna",
    name: "Curl Femoral Acostada con Mancuerna",
    muscleGroup: "Isquiotibiales (Parte posterior del muslo)",
    equipment: "1 Mancuerna ligera + Esterilla",
    instructions:
      "1. Acuéstate boca abajo en la colchoneta con el torso relajado.\n2. Sujeta con cuidado una mancuerna ligera verticalmente entre ambos pies.\n3. Flexiona las rodillas subiendo los pies hacia los glúteos de manera suave y progresiva.\n4. Aprieta los isquiotibiales arriba y baja controlando el descenso.",
    commonMistakes: "Despegar la cadera del suelo o dejar caer la mancuerna rápidamente.",
    alternative: "Puente de glúteos con talones más alejados en el suelo.",
    safetyWarning:
      "Comienza sin peso o con la mancuerna más liviana. Evita cualquier tirón o molestia en la corva.",
  },

  // --- PIERNAS CON RANGO ADAPTADO (NO SENTADILLA PROFUNDA) ---
  {
    slug: "box-squat-sentadilla-a-caja-silla",
    name: "Sentadilla a Silla (Rango Parcial a 90°)",
    muscleGroup: "Cuádriceps y Glúteos",
    equipment: "Silla firme / Sofá + Peso corporal o Mancuernas ligeras",
    instructions:
      "1. Colócate de pie frente a una silla firme, con los pies al ancho de hombros y puntas ligeramente hacia afuera.\n2. Empuja las caderas hacia atrás y flexiona las rodillas de forma controlada hasta rozar suavemente el asiento de la silla (90°).\n3. Sin relajarte sobre la silla, empuja con los talones y extiende las piernas para levantarte.\n4. ¡Importante: NO bajar más allá de la silla (evitar sentadilla profunda)!",
    commonMistakes: "Desplomarse en la silla sin control o dejar que las rodillas colapsen hacia adentro.",
    alternative: "Prensa de piernas isométrica suave contra la pared.",
    safetyWarning:
      "Restricción estricta de rodilla derecha: el asiento actúa como tope de seguridad garantizando que nunca se sobrepase el ángulo seguro de 90°.",
  },
  {
    slug: "zancada-estatica-corta-apoyada",
    name: "Split Squat Estático Corto con Apoyo",
    muscleGroup: "Cuádriceps y Glúteos",
    equipment: "Pared o Silla para apoyo + Peso corporal",
    instructions:
      "1. Da un paso corto adelante (un pie adelante y otro atrás, sin saltos ni zancadas dinámicas).\n2. Apóyate con una mano en una pared o silla para equilibrio absoluto.\n3. Desciende verticalmente solo unos centímetros de manera suave y controlada sin que la rodilla trasera toque el piso.\n4. Si la rodilla derecha siente cualquier tensión, reduce el rango de bajada a solo 20-30% del recorrido.",
    commonMistakes: "Dar pasos demasiado largos o adelantar la rodilla bruscamente.",
    alternative: "Puente de glúteos o elevación de talones para pantorrillas.",
    safetyWarning:
      "Ajustable: si hay molestia en la rodilla derecha, sustituir de inmediato por Puente de Glúteos.",
  },

  // --- CORE Y ABDOMEN (CERO IMPACTO) ---
  {
    slug: "plancha-frontal-antebrazos",
    name: "Plancha Frontal sobre Antebrazos",
    muscleGroup: "Core y Abdomen profundo",
    equipment: "Peso corporal + Esterilla",
    instructions:
      "1. Apoya los antebrazos en el suelo alineados con los hombros.\n2. Extiende el cuerpo con apoyo de rodillas (principiante) o puntas de los pies (avanzado).\n3. Activa fuertemente el abdomen contrayendo el ombligo hacia la columna.\n4. Mantén la respiración fluida y la posición firme durante el tiempo indicado.",
    commonMistakes: "Dejar caer la cadera hacia el piso o subir los glúteos formando una montaña.",
    alternative: "Plancha inclinada con manos apoyadas en el sofá.",
    safetyWarning:
      "Respira continuamente. No aguantes el aire para no elevar la presión arterial.",
  },
  {
    slug: "deadbug-bicho-muerto",
    name: "Deadbug (Bicho Muerto)",
    muscleGroup: "Core y Estabilidad Lumbo-Pélvica",
    equipment: "Peso corporal + Esterilla",
    instructions:
      "1. Acuéstate boca arriba con los brazos extendidos al techo y las rodillas a 90 grados sobre las caderas.\n2. Con la espalda baja totalmente pegada al suelo, extiende lentamente el brazo derecho atrás y la pierna izquierda adelante.\n3. Regresa al centro y alterna con brazo izquierdo y pierna derecha.\n4. El movimiento debe ser lento y coordinado.",
    commonMistakes: "Separar la espalda baja del suelo o mover los miembros con prisa.",
    alternative: "Press Pallof o contracciones isométricas de abdomen en suelo.",
    safetyWarning: "Movimiento suave y terapéutico, ideal para la zona lumbar y el abdomen.",
  },
  {
    slug: "bird-dog-perro-pajaro",
    name: "Bird-Dog (Perro-Pájaro)",
    muscleGroup: "Core, Glúteos y Espalda Baja",
    equipment: "Peso corporal + Esterilla",
    instructions:
      "1. En cuadrupedía, manos bajo hombros y rodillas bajo caderas.\n2. Extiende simultáneamente el brazo derecho al frente y la pierna izquierda atrás hasta formar una línea recta con el torso.\n3. Mantén 2 segundos arriba apretando el glúteo y el abdomen.\n4. Regresa al centro con lentitud y alterna de lado.",
    commonMistakes: "Arquear la espalda o balancear el cuerpo de lado a lado.",
    alternative: "Plancha de antebrazos con apoyo de rodillas.",
    safetyWarning: "Colocar apoyo acolchado bajo las rodillas para comodidad articular.",
  },

  // --- CARDIO Y MOVILIDAD ACTIVA ---
  {
    slug: "caminata-ligera-movilidad",
    name: "Caminata a Paso Ligero y Movilidad Activa",
    muscleGroup: "Cardiovascular y Movilidad General",
    equipment: "Zapatillas cómodas",
    instructions:
      "1. Realiza una caminata a paso constante y enérgico, ya sea al aire libre o en cinta/espacio plano.\n2. Mantén una postura erguida, hombros relajados y braceo natural.\n3. Al finalizar, realiza 5-10 minutos de movilidad suave para hombros, caderas y tobillos.",
    commonMistakes: "Caminar con calzado inadecuado o dar zancadas forzadas.",
    alternative: "Bicicleta estática con resistencia muy suave sin flexión forzada.",
    safetyWarning:
      "Ritmo conversacional: debes ser capaz de mantener una conversación fluida mientras caminas.",
  },
  {
    slug: "movilidad-articular-suave",
    name: "Movilidad Articular Suave y Estiramientos",
    muscleGroup: "Flexibilidad y Recuperación",
    equipment: "Esterilla / Ropa cómoda",
    instructions:
      "1. Círculos suaves de hombros hacia adelante y atrás.\n2. Movilidad torácica en cuadrupedía (Gato-Camello suave).\n3. Estiramiento de pectorales con apoyo en marco de puerta.\n4. Respiraciones profundas diafragmáticas.",
    commonMistakes: "Forzar rangos de dolor o hacer estiramientos balísticos con rebotes.",
    alternative: "Descanso pasivo total.",
    safetyWarning: "Movimientos fluidos que deben generar bienestar y relajación articular.",
  },
];

async function seedExercises() {
  console.log("-> Sembrando catálogo de ejercicios adaptados...");
  for (const ex of exercisesData) {
    await prisma.exercise.upsert({
      where: { slug: ex.slug },
      update: {
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        equipment: ex.equipment,
        instructions: ex.instructions,
        commonMistakes: ex.commonMistakes,
        alternative: ex.alternative,
        safetyWarning: ex.safetyWarning,
      },
      create: { ...ex },
    });
  }
  console.log(`✔ ${exercisesData.length} ejercicios registrados en catálogo.`);
}

async function seedPlanHim(userId: string) {
  console.log("-> Configurando plan semanal para: Él...");

  // Plan general para Él
  const plan = await prisma.workoutPlan.upsert({
    where: { userId },
    update: {
      name: "Plan Semanal de Fuerza, Cardio & Recomposición",
      description:
        "Diseñado para reducir grasa abdominal, conservar y desarrollar masa muscular y optimizar la condición cardiovascular.",
      notes:
        "Condición declarada: Hipertensión tratada. Recordatorio constante: respira continuamente durante las repeticiones (exhala en el esfuerzo, inhala en el descenso). Evita aguantar el aire (maniobra de Valsalva) y realiza descansos completos.",
    },
    create: {
      userId,
      name: "Plan Semanal de Fuerza, Cardio & Recomposición",
      description:
        "Diseñado para reducir grasa abdominal, conservar y desarrollar masa muscular y optimizar la condición cardiovascular.",
      notes:
        "Condición declarada: Hipertensión tratada. Recordatorio constante: respira continuamente durante las repeticiones (exhala en el esfuerzo, inhala en el descenso). Evita aguantar el aire (maniobra de Valsalva) y realiza descansos completos.",
    },
  });

  // Estructura de los 7 días para Él:
  const days = [
    {
      dayOfWeek: 1,
      dayName: "Lunes",
      title: "Pecho, Hombros y Tríceps",
      isRestDay: false,
      focusNotes:
        "Enfoque en empujes controlados. Calienta bien los hombros y respira con ritmo en cada repetición.",
      exercises: [
        { slug: "press-pecho-piso-mancuernas", order: 1, sets: 4, reps: "10-12", rest: 90, notes: "Apoyo seguro en suelo; pausa abajo de 1 segundo." },
        { slug: "press-militar-sentado-mancuernas", order: 2, sets: 3, reps: "10-12", rest: 90, notes: "Espalda apoyada firme; no arquees la columna lumbar." },
        { slug: "elevaciones-laterales-mancuernas", order: 3, sets: 3, reps: "12-15", rest: 60, notes: "Control estricto; mancuernas ligeras." },
        { slug: "extension-triceps-tras-nuca", order: 4, sets: 3, reps: "10-12", rest: 60, notes: "Codos pegados a las orejas; agarre firme." },
        { slug: "plancha-frontal-antebrazos", order: 5, sets: 3, reps: "30-45 seg", rest: 60, notes: "Respira continuamente; no aguantes la respiración." },
      ],
    },
    {
      dayOfWeek: 2,
      dayName: "Martes",
      title: "Piernas y Glúteos",
      isRestDay: false,
      focusNotes:
        "Trabajo de tren inferior con carga moderada y control postural. Enfoque en cadera y empuje de talones.",
      exercises: [
        { slug: "box-squat-sentadilla-a-caja-silla", order: 1, sets: 4, reps: "12-15", rest: 90, notes: "Control en la bajada; roce suave con la silla y sube." },
        { slug: "peso-muerto-rumano-mancuernas", order: 2, sets: 4, reps: "10-12", rest: 90, notes: "Bisagra de cadera hacia atrás; mantén mancuernas pegadas." },
        { slug: "puente-gluteos-suelo", order: 3, sets: 3, reps: "12-15", rest: 60, notes: "Pausa de 2 segundos apretando glúteos en la cima." },
        { slug: "deadbug-bicho-muerto", order: 4, sets: 3, reps: "10 por lado", rest: 60, notes: "Espalda pegada al suelo; movimiento pausado." },
      ],
    },
    {
      dayOfWeek: 3,
      dayName: "Miércoles",
      title: "Caminata a Paso Ligero y Movilidad",
      isRestDay: false,
      focusNotes:
        "Actividad cardiovascular aeróbica de bajo impacto y movilidad activa para recuperación.",
      exercises: [
        { slug: "caminata-ligera-movilidad", order: 1, sets: 1, reps: "35-45 min", rest: 0, notes: "Paso ligero y constante en terreno plano a ritmo conversacional." },
        { slug: "movilidad-articular-suave", order: 2, sets: 1, reps: "10 min", rest: 0, notes: "Estiramientos suaves de hombros, caderas y tronco." },
      ],
    },
    {
      dayOfWeek: 4,
      dayName: "Jueves",
      title: "Espalda y Bíceps",
      isRestDay: false,
      focusNotes:
        "Jalones y tracciones con mancuernas. Enfoque en retracción escapular y fuerza en brazos.",
      exercises: [
        { slug: "remo-unilateral-mancuerna", order: 1, sets: 4, reps: "10-12 por lado", rest: 90, notes: "Tira con el codo hacia la cadera; espalda neutra." },
        { slug: "remo-dos-brazos-conector", order: 2, sets: 3, reps: "10-12", rest: 90, notes: "Con barra conectora; aprieta escápulas atrás." },
        { slug: "curl-biceps-martillo", order: 3, sets: 3, reps: "10-12", rest: 60, notes: "Codos fijos a los costados; sin balanceo del tronco." },
        { slug: "bird-dog-perro-pajaro", order: 4, sets: 3, reps: "10 por lado", rest: 60, notes: "Excelente para estabilidad de columna y core." },
      ],
    },
    {
      dayOfWeek: 5,
      dayName: "Viernes",
      title: "Cuerpo Completo (Full Body)",
      isRestDay: false,
      focusNotes:
        "Circuito integral combinando tren superior, tren inferior y core para estímulo metabólico general.",
      exercises: [
        { slug: "press-pecho-piso-mancuernas", order: 1, sets: 3, reps: "10-12", rest: 90, notes: "Fuerza de empuje pectoral." },
        { slug: "peso-muerto-rumano-mancuernas", order: 2, sets: 3, reps: "10-12", rest: 90, notes: "Cadena posterior y glúteos." },
        { slug: "remo-unilateral-mancuerna", order: 3, sets: 3, reps: "10 por lado", rest: 90, notes: "Tracción de espalda dorsal." },
        { slug: "elevaciones-laterales-mancuernas", order: 4, sets: 3, reps: "12-15", rest: 60, notes: "Hombros laterales." },
        { slug: "plancha-frontal-antebrazos", order: 5, sets: 3, reps: "30-40 seg", rest: 60, notes: "Respiración continua." },
      ],
    },
    {
      dayOfWeek: 6,
      dayName: "Sábado",
      title: "Cardio Moderado y Movilidad",
      isRestDay: false,
      focusNotes:
        "Caminata vigorosa continua y descarga articular. Favorece la recuperación y salud cardiovascular.",
      exercises: [
        { slug: "caminata-ligera-movilidad", order: 1, sets: 1, reps: "40-50 min", rest: 0, notes: "Ritmo cómodo y sostenido." },
      ],
    },
    {
      dayOfWeek: 7,
      dayName: "Domingo",
      title: "Descanso Total",
      isRestDay: true,
      focusNotes:
        "Día de recuperación muscular y descanso en familia. Hidrátate bien y prepárate para la semana.",
      exercises: [],
    },
  ];

  for (const d of days) {
    const dayRecord = await prisma.workoutDay.upsert({
      where: {
        planId_dayOfWeek: {
          planId: plan.id,
          dayOfWeek: d.dayOfWeek,
        },
      },
      update: {
        dayName: d.dayName,
        title: d.title,
        isRestDay: d.isRestDay,
        focusNotes: d.focusNotes,
      },
      create: {
        planId: plan.id,
        dayOfWeek: d.dayOfWeek,
        dayName: d.dayName,
        title: d.title,
        isRestDay: d.isRestDay,
        focusNotes: d.focusNotes,
      },
    });

    // Limpiar ejercicios previos del día para asegurar orden idéntico e idempotente
    await prisma.workoutDayExercise.deleteMany({
      where: { workoutDayId: dayRecord.id },
    });

    for (const item of d.exercises) {
      const ex = await prisma.exercise.findUnique({ where: { slug: item.slug } });
      if (ex) {
        await prisma.workoutDayExercise.create({
          data: {
            workoutDayId: dayRecord.id,
            exerciseId: ex.id,
            order: item.order,
            targetSets: item.sets,
            targetReps: item.reps,
            restSeconds: item.rest,
            notes: item.notes,
            alternative: ex.alternative,
          },
        });
      }
    }
  }

  console.log("✔ Plan semanal de Él configurado con éxito.");
}

async function seedPlanHer(userId: string) {
  console.log("-> Configurando plan semanal para: Ella...");

  // Plan general para Ella
  const plan = await prisma.workoutPlan.upsert({
    where: { userId },
    update: {
      name: "Plan Semanal de Glúteos, Tonificación & Cuidado Articular",
      description:
        "Diseñado para recomposición corporal, glúteos, piernas, abdomen y brazos con restricción estricta de rodilla derecha.",
      notes:
        "Restricciones declaradas de rodilla derecha: Prohibido correr, saltar y sentadillas profundas. Todos los ejercicios son de bajo impacto o cadena posterior, con rango articular seguro, control de tempo y alternativas sin dolor.",
    },
    create: {
      userId,
      name: "Plan Semanal de Glúteos, Tonificación & Cuidado Articular",
      description:
        "Diseñado para recomposición corporal, glúteos, piernas, abdomen y brazos con restricción estricta de rodilla derecha.",
      notes:
        "Restricciones declaradas de rodilla derecha: Prohibido correr, saltar y sentadillas profundas. Todos los ejercicios son de bajo impacto o cadena posterior, con rango articular seguro, control de tempo y alternativas sin dolor.",
    },
  });

  // Estructura de los 7 días para Ella:
  const days = [
    {
      dayOfWeek: 1,
      dayName: "Lunes",
      title: "Glúteos y Cadena Posterior",
      isRestDay: false,
      focusNotes:
        "Cero impacto en rodilla derecha. Empuje puro de glúteo e isquiotibiales con técnica estricta.",
      exercises: [
        { slug: "hip-thrust-sofa-mancuerna", order: 1, sets: 4, reps: "12-15", rest: 90, notes: "Aprieta 2 segundos arriba; mirada al frente; rodillas alineadas." },
        { slug: "peso-muerto-rumano-mancuernas", order: 2, sets: 4, reps: "10-12", rest: 90, notes: "Bisagra pura de cadera; rodillas fijas sin doblar profundo." },
        { slug: "puente-gluteos-suelo", order: 3, sets: 3, reps: "15", rest: 60, notes: "Empuje desde talones; gran activación sin estrés articular." },
        { slug: "abduccion-cadera-lateral-suelo", order: 4, sets: 3, reps: "15-20 por lado", rest: 45, notes: "Fortalecimiento de glúteo medio para estabilidad de rodilla." },
        { slug: "patada-gluteo-cuadrupedia", order: 5, sets: 3, reps: "12-15 por lado", rest: 60, notes: "Usa almohadilla bajo rodilla de apoyo; contracción máxima." },
      ],
    },
    {
      dayOfWeek: 2,
      dayName: "Martes",
      title: "Tren Superior (Brazos, Espalda y Pecho)",
      isRestDay: false,
      focusNotes:
        "Tonificación de brazos, hombros elegantes y espalda erguida. Cero carga sobre rodillas.",
      exercises: [
        { slug: "remo-unilateral-mancuerna", order: 1, sets: 3, reps: "12 por lado", rest: 60, notes: "Jala con el codo hacia la cintura; espalda firme." },
        { slug: "press-pecho-piso-mancuernas", order: 2, sets: 3, reps: "10-12", rest: 60, notes: "Espalda apoyada en el suelo; movimiento controlado." },
        { slug: "elevaciones-laterales-mancuernas", order: 3, sets: 3, reps: "12-15", rest: 60, notes: "Mancuernas ligeras (1 o 1.5 kg); pausa arriba." },
        { slug: "curl-biceps-martillo", order: 4, sets: 3, reps: "12", rest: 60, notes: "Brazos firmes; sin balanceo del tronco." },
        { slug: "extension-triceps-tras-nuca", order: 5, sets: 3, reps: "12", rest: 60, notes: "Tonificación de la parte posterior del brazo." },
      ],
    },
    {
      dayOfWeek: 3,
      dayName: "Miércoles",
      title: "Caminata de Bajo Impacto y Abdomen",
      isRestDay: false,
      focusNotes:
        "Caminata suave en terreno plano (sin saltos, sin carrera) y fortalecimiento de core seguro.",
      exercises: [
        { slug: "caminata-ligera-movilidad", order: 1, sets: 1, reps: "30-40 min", rest: 0, notes: "Paso suave, continuo y cómodo con buen calzado amortiguado." },
        { slug: "deadbug-bicho-muerto", order: 2, sets: 3, reps: "10-12 por lado", rest: 60, notes: "Protege la espalda baja; control abdominal puro." },
        { slug: "bird-dog-perro-pajaro", order: 3, sets: 3, reps: "10 por lado", rest: 60, notes: "Estabilidad de columna y glúteo sin impacto." },
        { slug: "plancha-frontal-antebrazos", order: 4, sets: 3, reps: "25-35 seg", rest: 60, notes: "Apoyo en rodillas si se requiere para comodidad." },
      ],
    },
    {
      dayOfWeek: 4,
      dayName: "Jueves",
      title: "Piernas y Glúteos Adaptados (Sin Impacto)",
      isRestDay: false,
      focusNotes:
        "Fortalecimiento seguro de piernas. Solo rango a 90° con silla como tope seguro. Cero flexión profunda.",
      exercises: [
        { slug: "box-squat-sentadilla-a-caja-silla", order: 1, sets: 3, reps: "10-12", rest: 90, notes: "Sentadilla a silla a 90°; jamás bajar más allá del asiento." },
        { slug: "hip-thrust-sofa-mancuerna", order: 2, sets: 3, reps: "12-15", rest: 90, notes: "Gran estímulo en glúteos con rodilla protegida." },
        { slug: "peso-muerto-rumano-mancuernas", order: 3, sets: 3, reps: "12", rest: 90, notes: "Enfoque en isquiotibiales con rodillas semi-flexionadas fijas." },
        { slug: "abduccion-cadera-lateral-suelo", order: 4, sets: 3, reps: "15 por lado", rest: 45, notes: "Aislamiento lateral de cadera." },
        { slug: "curl-femoral-tumbada-mancuerna", order: 5, sets: 3, reps: "10-12", rest: 60, notes: "Carga muy ligera; flexión suave de rodilla boca abajo." },
      ],
    },
    {
      dayOfWeek: 5,
      dayName: "Viernes",
      title: "Cuerpo Completo (Full Body Adaptado)",
      isRestDay: false,
      focusNotes:
        "Sesión armónica para todo el cuerpo combinando glúteos, tren superior y zona media.",
      exercises: [
        { slug: "puente-gluteos-suelo", order: 1, sets: 3, reps: "15", rest: 60, notes: "Activación de glúteos y cadera." },
        { slug: "remo-unilateral-mancuerna", order: 2, sets: 3, reps: "10 por lado", rest: 60, notes: "Espalda y postura." },
        { slug: "press-pecho-piso-mancuernas", order: 3, sets: 3, reps: "10-12", rest: 60, notes: "Pecho y brazos en el suelo." },
        { slug: "elevaciones-laterales-mancuernas", order: 4, sets: 3, reps: "12", rest: 60, notes: "Hombros definidos." },
        { slug: "deadbug-bicho-muerto", order: 5, sets: 3, reps: "10 por lado", rest: 60, notes: "Abdomen plano y estabilidad." },
      ],
    },
    {
      dayOfWeek: 6,
      dayName: "Sábado",
      title: "Descanso o Movilidad Suave",
      isRestDay: true,
      focusNotes:
        "Día de recuperación. Si lo deseas, realiza estiramientos suaves o una caminata relajada.",
      exercises: [
        { slug: "movilidad-articular-suave", order: 1, sets: 1, reps: "15 min", rest: 0, notes: "Movilidad suave opcional para relajación." },
      ],
    },
    {
      dayOfWeek: 7,
      dayName: "Domingo",
      title: "Descanso Total",
      isRestDay: true,
      focusNotes:
        "Descanso total y recuperación en pareja. Nutrición adecuada y bienestar.",
      exercises: [],
    },
  ];

  for (const d of days) {
    const dayRecord = await prisma.workoutDay.upsert({
      where: {
        planId_dayOfWeek: {
          planId: plan.id,
          dayOfWeek: d.dayOfWeek,
        },
      },
      update: {
        dayName: d.dayName,
        title: d.title,
        isRestDay: d.isRestDay,
        focusNotes: d.focusNotes,
      },
      create: {
        planId: plan.id,
        dayOfWeek: d.dayOfWeek,
        dayName: d.dayName,
        title: d.title,
        isRestDay: d.isRestDay,
        focusNotes: d.focusNotes,
      },
    });

    // Limpiar ejercicios previos del día para asegurar orden idéntico e idempotente
    await prisma.workoutDayExercise.deleteMany({
      where: { workoutDayId: dayRecord.id },
    });

    for (const item of d.exercises) {
      const ex = await prisma.exercise.findUnique({ where: { slug: item.slug } });
      if (ex) {
        await prisma.workoutDayExercise.create({
          data: {
            workoutDayId: dayRecord.id,
            exerciseId: ex.id,
            order: item.order,
            targetSets: item.sets,
            targetReps: item.reps,
            restSeconds: item.rest,
            notes: item.notes,
            alternative: ex.alternative,
          },
        });
      }
    }
  }

  console.log("✔ Plan semanal de Ella configurado con éxito.");
}

export async function seedWorkouts() {
  console.log("=================================================");
  console.log("   FitCouple — Sembrado de Catálogo y Rutinas    ");
  console.log("=================================================");

  try {
    await seedExercises();

    const userHim = await prisma.user.findUnique({ where: { slug: "el" } });
    const userHer = await prisma.user.findUnique({ where: { slug: "ella" } });

    if (userHim) {
      await seedPlanHim(userHim.id);
    } else {
      console.warn("Usuario 'el' no encontrado.");
    }

    if (userHer) {
      await seedPlanHer(userHer.id);
    } else {
      console.warn("Usuario 'ella' no encontrado.");
    }

    console.log("\n=================================================");
    console.log("✔ Catálogo y planes semanales sembrados con éxito.");
    console.log("=================================================\n");
  } catch (error) {
    console.error("Error durante el sembrado de rutinas:", error);
    throw error;
  }
}

// Ejecutar directamente si se llama como script
if (require.main === module || process.argv[1]?.includes("seed-workouts")) {
  seedWorkouts()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
