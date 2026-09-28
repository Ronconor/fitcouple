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
  console.log("=== INICIANDO PRUEBAS DE SESIONES Y REGISTRO DE ENTRENAMIENTOS (FC-6 / FC-6.2) ===");

  const SYNTH_USER_1 = "test-session-synthetic-1";
  const SYNTH_USER_2 = "test-session-synthetic-2";

  try {
    // -------------------------------------------------------------
    // 1. Verificación en MODO SOLO LECTURA de usuarios reales y catálogo
    // -------------------------------------------------------------
    const realUsers = await prisma.user.findMany({
      where: { slug: { in: ["el", "ella"] } },
      select: { id: true, slug: true },
    });
    console.assert(realUsers.length === 2, "Usuarios reales 'el' y 'ella' deben existir.");
    console.log("✔ Verificación 1: Verificación de usuarios reales en MODO SOLO LECTURA.");

    // Obtener un ejercicio real del catálogo para usarlo en la prueba
    const sampleExercise = await prisma.exercise.findFirst();
    if (!sampleExercise) {
      throw new Error("No hay ejercicios en el catálogo. Asegúrate de ejecutar los seeds primero.");
    }

    // Limpieza preventiva de usuarios sintéticos
    await prisma.user.deleteMany({
      where: { slug: { in: [SYNTH_USER_1, SYNTH_USER_2] } },
    });

    // Crear dos usuarios sintéticos con planes y días de prueba
    const user1 = await prisma.user.create({
      data: {
        slug: SYNTH_USER_1,
        name: "Usuario Sesión 1",
        profile: { create: { displayName: "Sintético 1", unitPreference: "kg" } },
        workoutPlan: {
          create: {
            name: "Plan Sintético 1",
            days: {
              create: {
                dayOfWeek: 1,
                dayName: "Lunes",
                title: "Sesión Prueba 1",
                exercises: {
                  create: {
                    exerciseId: sampleExercise.id,
                    order: 1,
                    targetSets: 3,
                    targetReps: "10-12",
                    restSeconds: 60,
                  },
                },
              },
            },
          },
        },
      },
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

    const user2 = await prisma.user.create({
      data: {
        slug: SYNTH_USER_2,
        name: "Usuario Sesión 2",
        profile: { create: { displayName: "Sintético 2", unitPreference: "kg" } },
        workoutPlan: {
          create: {
            name: "Plan Sintético 2",
            days: {
              create: {
                dayOfWeek: 1,
                dayName: "Lunes",
                title: "Sesión Prueba 2",
                exercises: {
                  create: {
                    exerciseId: sampleExercise.id,
                    order: 1,
                    targetSets: 3,
                    targetReps: "10-12",
                    restSeconds: 60,
                  },
                },
              },
            },
          },
        },
      },
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

    const dayUser1 = user1.workoutPlan!.days[0];
    const dayUser2 = user2.workoutPlan!.days[0];
    const exerciseUser1 = dayUser1.exercises[0];
    const exerciseUser2 = dayUser2.exercises[0];

    // -------------------------------------------------------------
    // PRUEBA 2: Conversión de unidades (kg <-> lb)
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
    console.log("✔ Verificación 2: Lógica de conversión de unidades (kg <-> lb) validada.");

    // -------------------------------------------------------------
    // PRUEBA 3: Aislamiento al iniciar sesión (no se puede iniciar día ajeno)
    // -------------------------------------------------------------
    let unauthorizedFailed = false;
    try {
      // Usuario 1 intenta iniciar una sesión con el día de Usuario 2
      await createOrGetActiveSession(user1.id, dayUser2.id);
    } catch {
      unauthorizedFailed = true;
    }

    if (!unauthorizedFailed) {
      throw new Error("Fallo de seguridad: Un usuario pudo iniciar un día que no pertenece a su plan.");
    }
    console.log("✔ Verificación 3: Protección de inicio de sesión: usuarios no pueden usar días ajenos.");

    // -------------------------------------------------------------
    // PRUEBA 4: Creación de sesión e idempotencia (no duplicados)
    // -------------------------------------------------------------
    const session1 = await createOrGetActiveSession(user1.id, dayUser1.id);
    if (!session1 || session1.status !== "IN_PROGRESS") {
      throw new Error("No se pudo crear la sesión en progreso.");
    }

    const session1Dup = await createOrGetActiveSession(user1.id, dayUser1.id);
    if (session1.id !== session1Dup.id) {
      throw new Error("La función createOrGetActiveSession duplicó la sesión en lugar de retornar la activa.");
    }

    const activeUser1 = await getActiveWorkoutSession(user1.id, dayUser1.id);
    if (!activeUser1 || activeUser1.id !== session1.id) {
      throw new Error("getActiveWorkoutSession no encontró la sesión activa.");
    }
    console.log("✔ Verificación 4: Creación de sesión e idempotencia ante clics repetidos validada.");

    // -------------------------------------------------------------
    // PRUEBA 5: Registro y eliminación de series
    // -------------------------------------------------------------
    const set1 = await recordWorkoutSet(user1.id, session1.id, {
      workoutDayExerciseId: exerciseUser1.id,
      setNumber: 1,
      repsCompleted: 12,
      weightKg: 14.0,
    });

    if (!set1 || set1.repsCompleted !== 12 || set1.weightKg !== 14.0) {
      throw new Error("No se registró correctamente la serie 1.");
    }

    const set2 = await recordWorkoutSet(user1.id, session1.id, {
      workoutDayExerciseId: exerciseUser1.id,
      setNumber: 2,
      repsCompleted: 10,
      weightKg: 16.0,
    });

    // Validar que Usuario 2 no puede registrar series en la sesión de Usuario 1
    let crossRecordFailed = false;
    try {
      await recordWorkoutSet(user2.id, session1.id, {
        workoutDayExerciseId: exerciseUser1.id,
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
      await recordWorkoutSet(user1.id, session1.id, {
        workoutDayExerciseId: exerciseUser2.id,
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
    await removeWorkoutSet(user1.id, session1.id, set2.id);
    const sessionAfterDelete = await getWorkoutSession(session1.id, user1.id);
    if (!sessionAfterDelete || sessionAfterDelete.sets.length !== 1) {
      throw new Error("La serie no fue eliminada correctamente de la sesión.");
    }
    console.log("✔ Verificación 5: Registro, validación de pertenencia y eliminación de series operativo.");

    // -------------------------------------------------------------
    // PRUEBA 6: Finalización de sesión con notas
    // -------------------------------------------------------------
    const completedSession1 = await completeWorkoutSession(
      user1.id,
      session1.id,
      "[TEST-SYNTH] Excelente entrenamiento de prueba sintética"
    );

    if (completedSession1.status !== "COMPLETED" || !completedSession1.completedAt) {
      throw new Error("La sesión no se marcó como COMPLETED.");
    }

    // No se debe poder agregar series a una sesión ya finalizada
    let recordAfterCompleteFailed = false;
    try {
      await recordWorkoutSet(user1.id, session1.id, {
        workoutDayExerciseId: exerciseUser1.id,
        setNumber: 2,
        repsCompleted: 10,
      });
    } catch {
      recordAfterCompleteFailed = true;
    }

    if (!recordAfterCompleteFailed) {
      throw new Error("Se permitió registrar una serie en una sesión ya finalizada.");
    }
    console.log("✔ Verificación 6: Finalización de sesión, sellado y notas verificado.");

    // -------------------------------------------------------------
    // PRUEBA 7: Cancelación de sesión
    // -------------------------------------------------------------
    const session2 = await createOrGetActiveSession(user2.id, dayUser2.id);
    await recordWorkoutSet(user2.id, session2.id, {
      workoutDayExerciseId: exerciseUser2.id,
      setNumber: 1,
      repsCompleted: 15,
      weightKg: 5.0,
    });

    const cancelledSession2 = await cancelWorkoutSession(user2.id, session2.id);
    if (cancelledSession2.status !== "CANCELLED") {
      throw new Error("No se pudo cancelar la sesión.");
    }

    const activeUser2AfterCancel = await getActiveWorkoutSession(user2.id);
    if (activeUser2AfterCancel) {
      throw new Error("Sesión cancelada sigue apareciendo como activa.");
    }
    console.log("✔ Verificación 7: Cancelación y descarte de sesión validado.");

    // -------------------------------------------------------------
    // PRUEBA 8: Aislamiento estricto del historial (getUserCompletedSessions)
    // -------------------------------------------------------------
    const session2Completed = await createOrGetActiveSession(user2.id, dayUser2.id);
    await recordWorkoutSet(user2.id, session2Completed.id, {
      workoutDayExerciseId: exerciseUser2.id,
      setNumber: 1,
      repsCompleted: 12,
      weightKg: 8.0,
    });
    await completeWorkoutSession(user2.id, session2Completed.id, "[TEST-SYNTH] Sesión Usuario 2");

    const user1History = await getUserCompletedSessions(user1.id);
    const user2History = await getUserCompletedSessions(user2.id);

    const user1HasUser2Session = user1History.some((s) => s.id === session2Completed.id);
    if (user1HasUser2Session) {
      throw new Error("Fallo de aislamiento: Sesión de Usuario 2 apareció en historial de Usuario 1.");
    }

    const user2HasUser1Session = user2History.some((s) => s.id === session1.id);
    if (user2HasUser1Session) {
      throw new Error("Fallo de aislamiento: Sesión de Usuario 1 apareció en historial de Usuario 2.");
    }
    console.log("✔ Verificación 8: Aislamiento absoluto del historial entre usuarios comprobado.");

    console.log("\n=================================================");
    console.log("  TODAS LAS PRUEBAS DE SESIONES PASARON (PASS)  ");
    console.log("   LOS USUARIOS REALES ('el', 'ella') NUNCA      ");
    console.log("         FUERON MODIFICADOS NI USADOS            ");
    console.log("=================================================\n");
  } finally {
    // -------------------------------------------------------------
    // Cleanup 100% garantizado en FINALLY
    // -------------------------------------------------------------
    await prisma.user.deleteMany({
      where: { slug: { in: [SYNTH_USER_1, SYNTH_USER_2] } },
    });
    await prisma.$disconnect();
  }
}

runSessionTests().catch((err) => {
  console.error("❌ ERROR EN PRUEBAS FC-6:", err);
  process.exit(1);
});
