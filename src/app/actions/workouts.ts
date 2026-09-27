"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import {
  createOrGetActiveSession,
  recordWorkoutSet,
  removeWorkoutSet,
  completeWorkoutSession,
  cancelWorkoutSession,
} from "@/lib/sessions";
import { displayToKg, UnitPreference } from "@/lib/units";

export type SessionActionResult = {
  success?: boolean;
  sessionId?: string;
  error?: string;
};

/**
 * Inicia o reanuda una sesión de entrenamiento para el día indicado.
 */
export async function startWorkoutAction(workoutDayId: string): Promise<SessionActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "No autorizado. Inicia sesión para continuar." };
  }

  try {
    const session = await createOrGetActiveSession(user.id, workoutDayId);
    revalidatePath("/entrenamiento");
    revalidatePath(`/entrenamiento/sesion/${session.id}`);
    revalidatePath("/dashboard");
    return { success: true, sessionId: session.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al iniciar sesión de entrenamiento.";
    return { error: message };
  }
}

/**
 * Registra una serie completada.
 */
export async function recordSetAction(params: {
  sessionId: string;
  workoutDayExerciseId: string;
  setNumber: number;
  repsCompleted?: number | null;
  enteredWeight?: number | null;
  unit: UnitPreference;
  durationSeconds?: number | null;
}): Promise<SessionActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "No autorizado." };
  }

  try {
    const weightKg = params.enteredWeight !== undefined && params.enteredWeight !== null
      ? displayToKg(params.enteredWeight, params.unit)
      : null;

    await recordWorkoutSet(user.id, params.sessionId, {
      workoutDayExerciseId: params.workoutDayExerciseId,
      setNumber: params.setNumber,
      repsCompleted: params.repsCompleted,
      weightKg,
      durationSeconds: params.durationSeconds,
    });

    revalidatePath(`/entrenamiento/sesion/${params.sessionId}`);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al registrar la serie.";
    return { error: message };
  }
}

/**
 * Elimina una serie registrada por error.
 */
export async function removeSetAction(
  sessionId: string,
  setId: string
): Promise<SessionActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "No autorizado." };
  }

  try {
    await removeWorkoutSet(user.id, sessionId, setId);
    revalidatePath(`/entrenamiento/sesion/${sessionId}`);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al eliminar la serie.";
    return { error: message };
  }
}

/**
 * Finaliza la sesión de entrenamiento.
 */
export async function finishWorkoutAction(
  sessionId: string,
  notes?: string
): Promise<SessionActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "No autorizado." };
  }

  try {
    await completeWorkoutSession(user.id, sessionId, notes);
    revalidatePath("/entrenamiento");
    revalidatePath("/historial");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al finalizar el entrenamiento.";
    return { error: message };
  }
}

/**
 * Cancela una sesión en progreso.
 */
export async function cancelWorkoutAction(sessionId: string): Promise<SessionActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "No autorizado." };
  }

  try {
    await cancelWorkoutSession(user.id, sessionId);
    revalidatePath("/entrenamiento");
    revalidatePath("/historial");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al cancelar el entrenamiento.";
    return { error: message };
  }
}
