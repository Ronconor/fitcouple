import { PrismaClient } from "@prisma/client";
import {
  createOrGetActiveSession,
  recordWorkoutSet,
  removeWorkoutSet,
  completeWorkoutSession,
  cancelWorkoutSession,
  getUserCompletedSessions,
  getActiveWorkoutSession,
  getWorkoutSession,
} from "../src/lib/sessions";
import { displayToKg, kgToDisplay, formatWeight } from "../src/lib/units";

const prisma = new PrismaClient();

async function runSessionTests() {
  console.log("=== INICIANDO PRUEBAS DE SESIONES Y REGISTRO DE ENTRENAMIENTOS (FC-6) ===");

  try {
    // 1. Obtener usuarios Él y Ella
    const him = await prisma.user.findUnique({
      where: { slug: "el" },
      include: {
        workoutPlan: {
          include: {
            days: {
              include: {
                exercises: true,
              },
            },
          },
        },
      },
    });

    const her = await prisma.user.findUnique({
      where: { slug: "ella" },
      include: {
        workoutPlan: {
          include: {
            days: {
              include: {
                exercises: true,
              },
            },
          },
        },
      },
    });

    if (!him || !her || !him.workoutPlan || !her.workoutPlan) {
      throw new Error("Usuarios o planes no encontrados. Asegúrate de ejecutar los seeds primero.");
    }

    const himDay = him.workoutPlan.days.find((d) => !d.isRestDay)!;
    const herDay = her.workoutPlan.days.find((d) => !d.isRestDay)!;
    const himExercise = himDay.exercises[0];
    const herExercise = herDay.exercises[0];

    // Limpieza preventiva de sesiones de prueba previas
    await prisma.workoutSession.deleteMany({
      where: {
        userId: { in: [him.id, her.id] },
        notes: { contains: "[TEST-FC6]" },
      },
    });

    // -------------------------------------------------------------
    // PRUEBA 1: Conversión de unidades (kg <-> lb)
    // -------------------------------------------------------------
    const weightInKg = 10.0;
    const convertedToLb = kgToDisplay(weightInKg, "lb"); // ~22.0 lb
    if (!convertedToLb || Math.abs(convertedToLb - 22.0) > 0.2) {
      throw new Error(`Conversión kg a lb falló: esperado ~22.0, obtenido ${convertedToLb}`);
    }

    const backToKg = displayToKg(convertedToLb, "lb");
    if (!backToKg || Math.abs(backToKg - 10.0) > 0.2) {
      throw new Error(`Conversión lb a kg falló: esperado ~10.0, obtenido ${backToKg}`);
    }

    const formattedKg = formatWeight(15, "kg");
    const formattedLb = formatWeight(15, "lb");
    if (formattedKg !== "15 kg" || !formattedLb.includes("lb")) {
      throw new Error(`Formato de peso incorrecto: ${formattedKg}, ${formattedLb}`);
    }
    console.log("✔ Verificación 1: Lógica de conversión de unidades (kg <-> lb) validada.");

    // -------------------------------------------------------------
    // PRUEBA 2: Aislamiento al iniciar sesión (no se puede iniciar día ajeno)
    // -------------------------------------------------------------
    let unauthorizedFailed = false;
    try {
      // Él intenta iniciar una sesión con el día de Ella
      await createOrGetActiveSession(him.id, herDay.id);
    } catch {
      unauthorizedFailed = true;
    }

    if (!unauthorizedFailed) {
      throw new Error("Fallo de seguridad: Un usuario pudo iniciar un día que no pertenece a su plan.");
    }
    console.log("✔ Verificación 2: Protección de inicio de sesión: usuarios no pueden usar días ajenos.");

    // -------------------------------------------------------------
    // PRUEBA 3: Creación de sesión e idempotencia (no duplicados)
    // -------------------------------------------------------------
    const sessionHim1 = await createOrGetActiveSession(him.id, himDay.id);
    if (!sessionHim1 || sessionHim1.status !== "IN_PROGRESS") {
      throw new Error("No se pudo crear la sesión en progreso para Él.");
    }

    const sessionHim2 = await createOrGetActiveSession(him.id, himDay.id);
    if (sessionHim1.id !== sessionHim2.id) {
      throw new Error("La función createOrGetActiveSession duplicó la sesión en lugar de retornar la activa.");
    }

    const activeHim = await getActiveWorkoutSession(him.id, himDay.id);
    if (!activeHim || activeHim.id !== sessionHim1.id) {
      throw new Error("getActiveWorkoutSession no encontró la sesión activa.");
    }
    console.log("✔ Verificación 3: Creación de sesión e idempotencia ante clics repetidos validada.");

    // -------------------------------------------------------------
    // PRUEBA 4: Registro y eliminación de series
    // -------------------------------------------------------------
    const set1 = await recordWorkoutSet(him.id, sessionHim1.id, {
      workoutDayExerciseId: himExercise.id,
      setNumber: 1,
      repsCompleted: 12,
      weightKg: 14.0,
    });

    if (!set1 || set1.repsCompleted !== 12 || set1.weightKg !== 14.0) {
      throw new Error("No se registró correctamente la serie 1.");
    }

    const set2 = await recordWorkoutSet(him.id, sessionHim1.id, {
      workoutDayExerciseId: himExercise.id,
      setNumber: 2,
      repsCompleted: 10,
      weightKg: 16.0,
    });

    // Validar que Ella no puede registrar series en la sesión de Él
    let crossRecordFailed = false;
    try {
      await recordWorkoutSet(her.id, sessionHim1.id, {
        workoutDayExerciseId: himExercise.id,
        setNumber: 3,
        repsCompleted: 10,
        weightKg: 10.0,
      });
    } catch {
      crossRecordFailed = true;
    }

    if (!crossRecordFailed) {
      throw new Error("Fallo de aislamiento: Usuario ajeno pudo registrar series en una sesión no propia.");
    }

    // Validar que no se puede registrar un ejercicio que no pertenece al día
    let wrongExerciseFailed = false;
    try {
      await recordWorkoutSet(him.id, sessionHim1.id, {
        workoutDayExerciseId: herExercise.id,
        setNumber: 3,
        repsCompleted: 10,
        weightKg: 10.0,
      });
    } catch {
      wrongExerciseFailed = true;
    }

    if (!wrongExerciseFailed) {
      throw new Error("Fallo de validación: Se permitió registrar un ejercicio que no pertenece al día.");
    }

    // Eliminar serie 2 (para probar removeWorkoutSet)
    await removeWorkoutSet(him.id, sessionHim1.id, set2.id);
    const sessionAfterDelete = await getWorkoutSession(sessionHim1.id, him.id);
    if (!sessionAfterDelete || sessionAfterDelete.sets.length !== 1) {
      throw new Error("La serie no fue eliminada correctamente de la sesión.");
    }
    console.log("✔ Verificación 4: Registro, validación de pertenencia y eliminación de series operativo.");

    // -------------------------------------------------------------
    // PRUEBA 5: Finalización de sesión con notas
    // -------------------------------------------------------------
    const completedHim = await completeWorkoutSession(
      him.id,
      sessionHim1.id,
      "[TEST-FC6] Excelente entrenamiento de prueba"
    );

    if (completedHim.status !== "COMPLETED" || !completedHim.completedAt) {
      throw new Error("La sesión no se marcó como COMPLETED.");
    }

    // No se debe poder agregar series a una sesión ya finalizada
    let recordAfterCompleteFailed = false;
    try {
      await recordWorkoutSet(him.id, sessionHim1.id, {
        workoutDayExerciseId: himExercise.id,
        setNumber: 2,
        repsCompleted: 10,
      });
    } catch {
      recordAfterCompleteFailed = true;
    }

    if (!recordAfterCompleteFailed) {
      throw new Error("Se permitió registrar una serie en una sesión ya finalizada.");
    }
    console.log("✔ Verificación 5: Finalización de sesión, sellado y notas verificado.");

    // -------------------------------------------------------------
    // PRUEBA 6: Cancelación de sesión
    // -------------------------------------------------------------
    const sessionHer = await createOrGetActiveSession(her.id, herDay.id);
    await recordWorkoutSet(her.id, sessionHer.id, {
      workoutDayExerciseId: herExercise.id,
      setNumber: 1,
      repsCompleted: 15,
      weightKg: 5.0,
    });

    const cancelledHer = await cancelWorkoutSession(her.id, sessionHer.id);
    if (cancelledHer.status !== "CANCELLED") {
      throw new Error("No se pudo cancelar la sesión de Ella.");
    }

    const activeHerAfterCancel = await getActiveWorkoutSession(her.id);
    if (activeHerAfterCancel) {
      throw new Error("Sesión cancelada sigue apareciendo como activa.");
    }
    console.log("✔ Verificación 6: Cancelación y descarte de sesión validado.");

    // -------------------------------------------------------------
    // PRUEBA 7: Aislamiento estricto del historial (getUserCompletedSessions)
    // -------------------------------------------------------------
    // Crear una sesión completada para Ella
    const sessionHer2 = await createOrGetActiveSession(her.id, herDay.id);
    await recordWorkoutSet(her.id, sessionHer2.id, {
      workoutDayExerciseId: herExercise.id,
      setNumber: 1,
      repsCompleted: 12,
      weightKg: 8.0,
    });
    await completeWorkoutSession(her.id, sessionHer2.id, "[TEST-FC6] Sesión de Ella");

    const himHistory = await getUserCompletedSessions(him.id);
    const herHistory = await getUserCompletedSessions(her.id);

    // Validar que en el historial de Él NO aparece la sesión de Ella
    const himHasHerSession = himHistory.some((s) => s.id === sessionHer2.id);
    if (himHasHerSession) {
      throw new Error("Fallo crítico de privacidad: La sesión de Ella apareció en el historial de Él.");
    }

    // Validar que en el historial de Ella NO aparece la sesión de Él
    const herHasHimSession = herHistory.some((s) => s.id === sessionHim1.id);
    if (herHasHimSession) {
      throw new Error("Fallo crítico de privacidad: La sesión de Él apareció en el historial de Ella.");
    }
    console.log("✔ Verificación 7: Aislamiento absoluto del historial entre Él y Ella comprobado.");

    // -------------------------------------------------------------
    // LIMPIEZA FINAL DE DATOS DE PRUEBA
    // -------------------------------------------------------------
    await prisma.workoutSession.deleteMany({
      where: {
        id: { in: [sessionHim1.id, sessionHer.id, sessionHer2.id] },
      },
    });
    console.log("✔ Verificación 8: Limpieza de registros de prueba completada. Base de datos impecable.");

    console.log("\n=================================================");
    console.log("  TODAS LAS PRUEBAS DE FC-6 PASARON CON ÉXITO   ");
    console.log("=================================================\n");
  } finally {
    await prisma.$disconnect();
  }
}

runSessionTests().catch((err) => {
  console.error("❌ ERROR EN PRUEBAS FC-6:", err);
  process.exit(1);
});
