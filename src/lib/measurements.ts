import { prisma } from "@/lib/prisma";

export interface MeasurementInput {
  measuredAt: Date;
  weightKg?: number | null;
  waistCm?: number | null;
  hipCm?: number | null;
  chestCm?: number | null;
  armCm?: number | null;
  thighCm?: number | null;
  notes?: string | null;
}

/**
 * Valida que al menos una medida numérica válida esté presente.
 */
export function hasAtLeastOneMeasurement(data: MeasurementInput): boolean {
  return (
    (typeof data.weightKg === "number" && !isNaN(data.weightKg) && data.weightKg > 0) ||
    (typeof data.waistCm === "number" && !isNaN(data.waistCm) && data.waistCm > 0) ||
    (typeof data.hipCm === "number" && !isNaN(data.hipCm) && data.hipCm > 0) ||
    (typeof data.chestCm === "number" && !isNaN(data.chestCm) && data.chestCm > 0) ||
    (typeof data.armCm === "number" && !isNaN(data.armCm) && data.armCm > 0) ||
    (typeof data.thighCm === "number" && !isNaN(data.thighCm) && data.thighCm > 0)
  );
}

/**
 * Obtiene todas las medidas del usuario ordenadas cronológicamente (más antigua primero para gráficos).
 */
export async function getUserMeasurementsChronological(userId: string) {
  return prisma.bodyMeasurement.findMany({
    where: { userId },
    orderBy: { measuredAt: "asc" },
  });
}

/**
 * Obtiene el historial de medidas del usuario ordenadas de más reciente a más antigua.
 */
export async function getUserMeasurementsHistory(userId: string) {
  return prisma.bodyMeasurement.findMany({
    where: { userId },
    orderBy: { measuredAt: "desc" },
  });
}

/**
 * Obtiene una medición específica verificando que pertenezca al usuario autenticado.
 */
export async function getMeasurementById(userId: string, measurementId: string) {
  return prisma.bodyMeasurement.findFirst({
    where: {
      id: measurementId,
      userId,
    },
  });
}

/**
 * Registra una nueva medición corporal para el usuario autenticado.
 */
export async function createMeasurement(userId: string, data: MeasurementInput) {
  if (!hasAtLeastOneMeasurement(data)) {
    throw new Error("Debes registrar al menos una medida numérica (peso, cintura, etc.).");
  }

  // Sanitización de números: si no es válido o es <= 0, se almacena como null
  const sanitize = (val?: number | null) =>
    typeof val === "number" && !isNaN(val) && val > 0 ? Math.round(val * 10) / 10 : null;

  return prisma.bodyMeasurement.create({
    data: {
      userId,
      measuredAt: data.measuredAt,
      weightKg: sanitize(data.weightKg),
      waistCm: sanitize(data.waistCm),
      hipCm: sanitize(data.hipCm),
      chestCm: sanitize(data.chestCm),
      armCm: sanitize(data.armCm),
      thighCm: sanitize(data.thighCm),
      notes: data.notes?.trim() || null,
    },
  });
}

/**
 * Actualiza una medición existente verificando pertenencia del usuario.
 */
export async function updateMeasurement(
  userId: string,
  measurementId: string,
  data: MeasurementInput
) {
  const existing = await getMeasurementById(userId, measurementId);
  if (!existing) {
    throw new Error("Medición no encontrada o no autorizada.");
  }

  if (!hasAtLeastOneMeasurement(data)) {
    throw new Error("Debes registrar al menos una medida numérica.");
  }

  const sanitize = (val?: number | null) =>
    typeof val === "number" && !isNaN(val) && val > 0 ? Math.round(val * 10) / 10 : null;

  return prisma.bodyMeasurement.update({
    where: { id: measurementId },
    data: {
      measuredAt: data.measuredAt,
      weightKg: sanitize(data.weightKg),
      waistCm: sanitize(data.waistCm),
      hipCm: sanitize(data.hipCm),
      chestCm: sanitize(data.chestCm),
      armCm: sanitize(data.armCm),
      thighCm: sanitize(data.thighCm),
      notes: data.notes?.trim() || null,
    },
  });
}

/**
 * Elimina una medición verificando que pertenezca al usuario autenticado.
 */
export async function deleteMeasurement(userId: string, measurementId: string) {
  const existing = await getMeasurementById(userId, measurementId);
  if (!existing) {
    throw new Error("Medición no encontrada o no autorizada.");
  }

  return prisma.bodyMeasurement.delete({
    where: { id: measurementId },
  });
}

/**
 * Estructura de cambio numérico neutro entre dos valores.
 */
export interface MetricDiff {
  first: number | null;
  latest: number | null;
  diff: number | null;
}

export interface ProgressSummary {
  firstDate: Date | null;
  latestDate: Date | null;
  totalMeasurements: number;
  weight: MetricDiff;
  waist: MetricDiff;
  hip: MetricDiff;
  chest: MetricDiff;
  arm: MetricDiff;
  thigh: MetricDiff;
}

/**
 * Calcula el resumen de progreso entre la primera y última medición disponible.
 * No emite juicios de valor ("bueno" o "malo"), solo diferencias matemáticas neutras.
 */
export function calculateProgressSummary(
  measurementsAsc: Array<{
    measuredAt: Date;
    weightKg: number | null;
    waistCm: number | null;
    hipCm: number | null;
    chestCm: number | null;
    armCm: number | null;
    thighCm: number | null;
  }>
): ProgressSummary {
  if (measurementsAsc.length === 0) {
    const emptyMetric: MetricDiff = { first: null, latest: null, diff: null };
    return {
      firstDate: null,
      latestDate: null,
      totalMeasurements: 0,
      weight: emptyMetric,
      waist: emptyMetric,
      hip: emptyMetric,
      chest: emptyMetric,
      arm: emptyMetric,
      thigh: emptyMetric,
    };
  }

  const firstDate = measurementsAsc[0].measuredAt;
  const latestDate = measurementsAsc[measurementsAsc.length - 1].measuredAt;

  const calculateMetricDiff = (
    accessor: (m: (typeof measurementsAsc)[0]) => number | null
  ): MetricDiff => {
    // Buscar primer registro que contenga este dato
    const firstWithVal = measurementsAsc.find((m) => accessor(m) !== null && accessor(m) !== undefined);
    // Buscar último registro que contenga este dato
    const latestWithVal = [...measurementsAsc].reverse().find((m) => accessor(m) !== null && accessor(m) !== undefined);

    if (!firstWithVal || !latestWithVal) {
      return { first: null, latest: null, diff: null };
    }

    const first = accessor(firstWithVal);
    const latest = accessor(latestWithVal);

    if (first === null || latest === null) {
      return { first: null, latest: null, diff: null };
    }

    const diff = Math.round((latest - first) * 10) / 10;
    return { first, latest, diff };
  };

  return {
    firstDate,
    latestDate,
    totalMeasurements: measurementsAsc.length,
    weight: calculateMetricDiff((m) => m.weightKg),
    waist: calculateMetricDiff((m) => m.waistCm),
    hip: calculateMetricDiff((m) => m.hipCm),
    chest: calculateMetricDiff((m) => m.chestCm),
    arm: calculateMetricDiff((m) => m.armCm),
    thigh: calculateMetricDiff((m) => m.thighCm),
  };
}
