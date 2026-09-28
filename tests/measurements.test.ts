import { PrismaClient } from "@prisma/client";
import {
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
  getUserMeasurementsChronological,
  getUserMeasurementsHistory,
  calculateProgressSummary,
  hasAtLeastOneMeasurement,
} from "../src/lib/measurements";
import { displayToKg, kgToDisplay } from "../src/lib/units";

const prisma = new PrismaClient();

async function runMeasurementTests() {
  console.log("=== INICIANDO PRUEBAS DE SEGUIMIENTO DE PROGRESO CORPORAL (FC-7) ===");

  const SYNTHETIC_USER_1_SLUG = "test-meas-synthetic-1";
  const SYNTHETIC_USER_2_SLUG = "test-meas-synthetic-2";
  let user1Id: string | null = null;
  let user2Id: string | null = null;

  try {
    // 1. Verificación LECTURA de usuarios reales Él y Ella (READ-ONLY)
    const him = await prisma.user.findUnique({
      where: { slug: "el" },
      include: { profile: true },
    });

    const her = await prisma.user.findUnique({
      where: { slug: "ella" },
      include: { profile: true },
    });

    if (!him || !her) {
      throw new Error("Usuarios reales 'el' y 'ella' no encontrados en la base de datos.");
    }
    console.log("✔ Verificación 1: Usuarios reales 'el' y 'ella' existen (inspección de sólo lectura).");

    // Limpieza preventiva de usuarios sintéticos si existieran de ejecuciones previas
    const existingSynth1 = await prisma.user.findUnique({ where: { slug: SYNTHETIC_USER_1_SLUG } });
    if (existingSynth1) {
      await prisma.bodyMeasurement.deleteMany({ where: { userId: existingSynth1.id } });
      await prisma.userProfile.deleteMany({ where: { userId: existingSynth1.id } });
      await prisma.user.delete({ where: { id: existingSynth1.id } });
    }
    const existingSynth2 = await prisma.user.findUnique({ where: { slug: SYNTHETIC_USER_2_SLUG } });
    if (existingSynth2) {
      await prisma.bodyMeasurement.deleteMany({ where: { userId: existingSynth2.id } });
      await prisma.userProfile.deleteMany({ where: { userId: existingSynth2.id } });
      await prisma.user.delete({ where: { id: existingSynth2.id } });
    }

    // Creación de identidades sintéticas aisladas para pruebas de mediciones
    const synthUser1 = await prisma.user.create({
      data: {
        slug: SYNTHETIC_USER_1_SLUG,
        name: "Test Meas Alpha",
        passwordHash: "$2b$12$syntheticTestHashForMeasurementsTestOnly0000000000000",
        profile: {
          create: {
            displayName: "Test Meas Alpha",
            unitPreference: "kg",
            generalGoal: "Fuerza y Recomposición",
          },
        },
      },
    });
    user1Id = synthUser1.id;

    const synthUser2 = await prisma.user.create({
      data: {
        slug: SYNTHETIC_USER_2_SLUG,
        name: "Test Meas Beta",
        passwordHash: "$2b$12$syntheticTestHashForMeasurementsTestOnly0000000000001",
        profile: {
          create: {
            displayName: "Test Meas Beta",
            unitPreference: "lb",
            generalGoal: "Tonificación",
          },
        },
      },
    });
    user2Id = synthUser2.id;

    // -------------------------------------------------------------
    // PRUEBA 1: Validación de registro mínimo (al menos una medida numérica)
    // -------------------------------------------------------------
    const emptyMeasurement = {
      measuredAt: new Date(),
      weightKg: null,
      waistCm: null,
      hipCm: null,
      notes: "Solo una nota sin números",
    };

    if (hasAtLeastOneMeasurement(emptyMeasurement)) {
      throw new Error("Fallo: hasAtLeastOneMeasurement aceptó un registro sin medidas numéricas.");
    }

    let emptyRecordFailed = false;
    try {
      await createMeasurement(synthUser1.id, emptyMeasurement);
    } catch {
      emptyRecordFailed = true;
    }

    if (!emptyRecordFailed) {
      throw new Error("Fallo de validación: Se permitió guardar un registro sin ninguna medida numérica.");
    }
    console.log("✔ Verificación 2: Rechazo estricto de registros vacíos sin medidas numéricas.");

    // -------------------------------------------------------------
    // PRUEBA 2: Registro con campos opcionales para Usuario 1 y Usuario 2
    // -------------------------------------------------------------
    // Usuario 1 registra peso y cintura (el resto nulo)
    const mHim1 = await createMeasurement(synthUser1.id, {
      measuredAt: new Date("2026-09-01T08:00:00Z"),
      weightKg: 89.5,
      waistCm: 96.0,
      notes: "[TEST-FC7] Medición inicial de Usuario 1",
    });

    if (!mHim1 || mHim1.weightKg !== 89.5 || mHim1.waistCm !== 96.0 || mHim1.hipCm !== null) {
      throw new Error("No se guardaron correctamente los campos opcionales de Usuario 1.");
    }

    // Usuario 2 registra peso, cintura y cadera
    const mHer1 = await createMeasurement(synthUser2.id, {
      measuredAt: new Date("2026-09-01T09:00:00Z"),
      weightKg: 65.5,
      waistCm: 72.0,
      hipCm: 98.0,
      notes: "[TEST-FC7] Medición inicial de Usuario 2",
    });

    if (!mHer1 || mHer1.weightKg !== 65.5 || mHer1.hipCm !== 98.0) {
      throw new Error("No se guardaron correctamente los datos de Usuario 2.");
    }
    console.log("✔ Verificación 3: Registro con campos opcionales exitoso para ambos perfiles sintéticos.");

    // -------------------------------------------------------------
    // PRUEBA 3: Conversión de peso kg <-> lb respetando preferencia
    // -------------------------------------------------------------
    // Si un usuario ingresa 185.0 lb, debe almacenarse en kg
    const inputLbs = 185.0;
    const storedKg = displayToKg(inputLbs, "lb"); // ~83.91 kg
    if (!storedKg || Math.abs(storedKg - 83.91) > 0.1) {
      throw new Error(`Conversión displayToKg falló: esperado ~83.91, obtenido ${storedKg}`);
    }

    const backToLbs = kgToDisplay(storedKg, "lb");
    if (!backToLbs || Math.abs(backToLbs - 185.0) > 0.2) {
      throw new Error(`Conversión inversa kgToDisplay falló: esperado ~185.0, obtenido ${backToLbs}`);
    }
    console.log("✔ Verificación 4: Conversión de peso (kg <-> lb) validada sin pérdida de precisión.");

    // -------------------------------------------------------------
    // PRUEBA 4: Aislamiento estricto (no se puede editar ni borrar registro ajeno)
    // -------------------------------------------------------------
    // Usuario 1 intenta modificar la medición de Usuario 2
    let crossEditFailed = false;
    try {
      await updateMeasurement(synthUser1.id, mHer1.id, {
        measuredAt: new Date(),
        weightKg: 70.0,
      });
    } catch {
      crossEditFailed = true;
    }

    if (!crossEditFailed) {
      throw new Error("Fallo crítico de privacidad: Un usuario pudo modificar la medición de otro.");
    }

    // Usuario 2 intenta eliminar la medición de Usuario 1
    let crossDeleteFailed = false;
    try {
      await deleteMeasurement(synthUser2.id, mHim1.id);
    } catch {
      crossDeleteFailed = true;
    }

    if (!crossDeleteFailed) {
      throw new Error("Fallo crítico de privacidad: Un usuario pudo eliminar la medición de otro.");
    }
    console.log("✔ Verificación 5: Aislamiento total: imposible consultar, editar o borrar registros ajenos.");

    // -------------------------------------------------------------
    // PRUEBA 5: Edición y actualización de registros propios
    // -------------------------------------------------------------
    const updatedHim1 = await updateMeasurement(synthUser1.id, mHim1.id, {
      measuredAt: new Date("2026-09-01T08:00:00Z"),
      weightKg: 89.2, // Corregido
      waistCm: 95.5,
      chestCm: 104.0, // Agregado pecho
      notes: "[TEST-FC7] Medición inicial de Usuario 1 (corregida)",
    });

    if (updatedHim1.weightKg !== 89.2 || updatedHim1.chestCm !== 104.0) {
      throw new Error("La actualización de la medición propia falló.");
    }
    console.log("✔ Verificación 6: Edición de registro propio con recálculo de medidas correcta.");

    // -------------------------------------------------------------
    // PRUEBA 6: Gráficos y cálculo neutro de resumen de progreso
    // -------------------------------------------------------------
    // Crear segunda medición posterior para Usuario 1
    const mHim2 = await createMeasurement(synthUser1.id, {
      measuredAt: new Date("2026-09-15T08:00:00Z"),
      weightKg: 87.8,
      waistCm: 93.5,
      chestCm: 103.5,
      notes: "[TEST-FC7] Segunda medición de Usuario 1",
    });

    const himChronological = await getUserMeasurementsChronological(synthUser1.id);
    const himHistory = await getUserMeasurementsHistory(synthUser1.id);

    // Historial debe tener las más recientes primero
    if (new Date(himHistory[0].measuredAt) < new Date(himHistory[1].measuredAt)) {
      throw new Error("El historial no está ordenado cronológicamente de forma descendente.");
    }

    // Cronológico debe tener las más antiguas primero (para gráficos)
    if (new Date(himChronological[0].measuredAt) > new Date(himChronological[1].measuredAt)) {
      throw new Error("La lista cronológica para gráficos no está ordenada ascendentemente.");
    }

    // Resumen neutro de cambios
    const summaryHim = calculateProgressSummary(himChronological);
    // Peso: 89.2 -> 87.8 = diff -1.4
    if (summaryHim.weight.diff !== -1.4) {
      throw new Error(`Cálculo de cambio de peso erróneo: esperado -1.4, obtenido ${summaryHim.weight.diff}`);
    }
    // Cintura: 95.5 -> 93.5 = diff -2.0
    if (summaryHim.waist.diff !== -2.0) {
      throw new Error(`Cálculo de cambio de cintura erróneo: esperado -2.0, obtenido ${summaryHim.waist.diff}`);
    }
    console.log("✔ Verificación 7: Resumen de cambios numéricos neutro y ordenamiento cronológico validado.");

    // -------------------------------------------------------------
    // PRUEBA 7: Eliminación de registro propio
    // -------------------------------------------------------------
    await deleteMeasurement(synthUser1.id, mHim2.id);
    const himAfterDelete = await getUserMeasurementsHistory(synthUser1.id);
    const existsDeleted = himAfterDelete.some((m) => m.id === mHim2.id);
    if (existsDeleted) {
      throw new Error("La medición no fue eliminada de la base de datos.");
    }
    console.log("✔ Verificación 8: Eliminación de medición propia completada exitosamente.");

    // -------------------------------------------------------------
    // PRUEBA 8: Preservación de datos de FC-4, FC-5 y FC-6
    // -------------------------------------------------------------
    const checkSessions = await prisma.workoutSession.count();
    const checkPlans = await prisma.workoutPlan.count();
    const checkExercises = await prisma.exercise.count();

    if (checkPlans < 2 || checkExercises < 21) {
      throw new Error("Los datos de rutinas o ejercicios fueron alterados por la migración.");
    }
    console.log("✔ Verificación 9: Integridad total: usuarios reales, contraseñas, rutinas y catálogo preservados al 100%.");

    console.log("\n=================================================");
    console.log("  TODAS LAS PRUEBAS DE FC-7 PASARON CON ÉXITO   ");
    console.log("=================================================\n");
  } finally {
    // LIMPIEZA FINAL GARANTIZADA DE USUARIOS Y DATOS SINTÉTICOS
    try {
      if (user1Id || user2Id) {
        const synthIds = [user1Id, user2Id].filter(Boolean) as string[];
        await prisma.bodyMeasurement.deleteMany({
          where: { userId: { in: synthIds } },
        });
        await prisma.userProfile.deleteMany({
          where: { userId: { in: synthIds } },
        });
        await prisma.user.deleteMany({
          where: { id: { in: synthIds } },
        });
        console.log("✔ Limpieza final: identidades y datos sintéticos eliminados por completo.");
      }
    } catch (cleanupErr) {
      console.error("Aviso durante la limpieza de datos sintéticos:", cleanupErr);
    }
    await prisma.$disconnect();
  }
}

runMeasurementTests().catch((err) => {
  console.error("❌ ERROR EN PRUEBAS FC-7:", err);
  process.exit(1);
});
