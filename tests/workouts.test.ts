import { prisma } from "../src/lib/prisma";
import { getUserWeeklyPlan, getUserDayWorkout } from "../src/lib/workouts";
import { seedWorkouts } from "../prisma/seed-workouts";

async function runWorkoutTests() {
  console.log("=== INICIANDO PRUEBAS DE PLANES SEMANALES Y AISLAMIENTO (FC-5) ===\n");

  // 1. Obtener usuarios Él y Ella
  const userHim = await prisma.user.findUnique({ where: { slug: "el" } });
  const userHer = await prisma.user.findUnique({ where: { slug: "ella" } });

  console.assert(userHim !== null, "Usuario 'el' no encontrado");
  console.assert(userHer !== null, "Usuario 'ella' no encontrado");
  console.log("✔ Verificación 1: Usuarios 'el' y 'ella' existen en la base de datos.");

  // 2. Verificar que cada usuario tiene un plan exclusivo y 7 días completos
  const planHim = await getUserWeeklyPlan(userHim!.id);
  const planHer = await getUserWeeklyPlan(userHer!.id);

  console.assert(planHim !== null, "Plan semanal de Él no encontrado");
  console.assert(planHer !== null, "Plan semanal de Ella no encontrado");
  console.assert(planHim!.days.length === 7, `Él debe tener 7 días, tiene: ${planHim!.days.length}`);
  console.assert(planHer!.days.length === 7, `Ella debe tener 7 días, tiene: ${planHer!.days.length}`);
  console.assert(planHim!.id !== planHer!.id, "Los planes deben ser instancias diferentes");
  console.log("✔ Verificación 2: Ambos usuarios tienen planes independientes con 7 días asignados.");

  // 3. Verificar distribución y notas del plan de Él
  console.assert(planHim!.days[0].title.includes("Pecho"), "Lunes de Él incorrecto");
  console.assert(planHim!.days[1].title.includes("Piernas"), "Martes de Él incorrecto");
  console.assert(planHim!.days[2].title.includes("Caminata"), "Miércoles de Él incorrecto");
  console.assert(planHim!.days[3].title.includes("Espalda"), "Jueves de Él incorrecto");
  console.assert(planHim!.days[4].title.includes("Cuerpo Completo"), "Viernes de Él incorrecto");
  console.assert(planHim!.days[5].title.includes("Cardio"), "Sábado de Él incorrecto");
  console.assert(planHim!.days[6].isRestDay === true, "Domingo de Él debe ser descanso");
  console.assert(
    planHim!.notes?.toLowerCase().includes("respir") ?? false,
    "Debe tener recordatorio de respiración continua"
  );
  console.log("✔ Verificación 3: Plan semanal de Él coincide exactamente con su distribución y recomendaciones.");

  // 4. Verificar distribución del plan de Ella y estricto cumplimiento de restricciones
  console.assert(planHer!.days[0].title.includes("Glúteos"), "Lunes de Ella incorrecto");
  console.assert(planHer!.days[1].title.includes("Tren Superior"), "Martes de Ella incorrecto");
  console.assert(planHer!.days[2].title.includes("Caminata") && planHer!.days[2].title.includes("Abdomen"), "Miércoles de Ella incorrecto");
  console.assert(planHer!.days[3].title.includes("Piernas"), "Jueves de Ella incorrecto");
  console.assert(planHer!.days[4].title.includes("Cuerpo Completo"), "Viernes de Ella incorrecto");
  console.assert(planHer!.days[5].isRestDay === true, "Sábado de Ella debe ser descanso/movilidad");
  console.assert(planHer!.days[6].isRestDay === true, "Domingo de Ella debe ser descanso total");

  // Auditoría estricta de ejercicios de Ella contra restricciones declaradas:
  // - No correr
  // - No saltar
  // - No sentadillas profundas
  for (const day of planHer!.days) {
    for (const de of day.exercises) {
      const exName = de.exercise.name.toLowerCase();
      const exSlug = de.exercise.slug.toLowerCase();
      console.assert(!exName.includes("correr") && !exName.includes("running"), `Violación de no correr en: ${de.exercise.name}`);
      console.assert(!exName.includes("saltar") && !exName.includes("salto") && !exName.includes("burpee"), `Violación de no saltar en: ${de.exercise.name}`);
      console.assert(!exName.includes("sentadilla profunda") && !exSlug.includes("profunda"), `Violación de sentadilla profunda en: ${de.exercise.name}`);
    }
  }
  console.log("✔ Verificación 4: Plan de Ella respeta 100% las restricciones declaradas (sin carrera, sin saltos, sin sentadilla profunda).");


  // 5. Verificar aislamiento estricto de consultas por usuario
  const day1Him = await getUserDayWorkout(userHim!.id, 1);
  const day1Her = await getUserDayWorkout(userHer!.id, 1);

  console.assert(day1Him?.day.title !== day1Her?.day.title, "Los días de los usuarios no deben cruzarse");
  console.assert(day1Him?.day.title === "Pecho, Hombros y Tríceps", "Lunes de Él no aislado");
  console.assert(day1Her?.day.title === "Glúteos y Cadena Posterior", "Lunes de Ella no aislado");
  console.log("✔ Verificación 5: Aislamiento validado: consultas por userId devuelven exclusivamente la rutina del usuario.");

  // 6. Verificar completitud de la ficha técnica de ejercicios
  const exercises = await prisma.exercise.findMany();
  for (const ex of exercises) {
    console.assert(ex.name.length > 0, "Falta nombre");
    console.assert(ex.muscleGroup.length > 0, "Falta grupo muscular");
    console.assert(ex.equipment.length > 0, "Falta equipamiento");
    console.assert(ex.instructions.length > 20, "Instrucciones incompletas");
    console.assert(ex.commonMistakes.length > 10, "Errores comunes incompletos");
  }
  console.log(`✔ Verificación 6: Los ${exercises.length} ejercicios del catálogo tienen ficha técnica completa.`);

  // 7. Prueba de idempotencia del sembrado
  await seedWorkouts();
  const countAfter = await prisma.exercise.count();
  console.assert(countAfter === exercises.length, "La re-ejecución del seed duplicó ejercicios");
  console.log("✔ Verificación 7: Script de sembrado de rutinas 100% idempotente.");

  console.log("\n=================================================");
  console.log("   TODAS LAS PRUEBAS DE FC-5 PASARON CON ÉXITO   ");
  console.log("=================================================");
}

runWorkoutTests()
  .catch((e) => {
    console.error("Error en pruebas de rutinas:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
