"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import {
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
  MeasurementInput,
} from "@/lib/measurements";
import { displayToKg, UnitPreference } from "@/lib/units";

export type MeasurementActionResult = {
  success?: boolean;
  error?: string;
  measurementId?: string;
};

export async function saveMeasurementAction(params: {
  id?: string;
  measuredAt: string; // ISO date string (YYYY-MM-DD or datetime)
  enteredWeight?: number | null;
  unit: UnitPreference;
  waistCm?: number | null;
  hipCm?: number | null;
  chestCm?: number | null;
  armCm?: number | null;
  thighCm?: number | null;
  notes?: string | null;
}): Promise<MeasurementActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "No autorizado. Inicia sesión para continuar." };
  }

  try {
    // Validar y parsear fecha
    const parsedDate = new Date(params.measuredAt);
    const measuredAt = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

    // Convertir peso a kg si fue ingresado en lb
    const weightKg =
      typeof params.enteredWeight === "number" && !isNaN(params.enteredWeight) && params.enteredWeight > 0
        ? displayToKg(params.enteredWeight, params.unit)
        : null;

    const data: MeasurementInput = {
      measuredAt,
      weightKg,
      waistCm: params.waistCm ?? null,
      hipCm: params.hipCm ?? null,
      chestCm: params.chestCm ?? null,
      armCm: params.armCm ?? null,
      thighCm: params.thighCm ?? null,
      notes: params.notes ?? null,
    };

    if (params.id) {
      await updateMeasurement(user.id, params.id, data);
    } else {
      const created = await createMeasurement(user.id, data);
      params.id = created.id;
    }

    revalidatePath("/progreso");
    revalidatePath("/dashboard");
    return { success: true, measurementId: params.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al guardar la medición.";
    return { error: message };
  }
}

export async function deleteMeasurementAction(
  measurementId: string
): Promise<MeasurementActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "No autorizado." };
  }

  try {
    await deleteMeasurement(user.id, measurementId);
    revalidatePath("/progreso");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al eliminar la medición.";
    return { error: message };
  }
}
