import { prisma } from "@/lib/prisma";

export type SessionWithDetails = Awaited<ReturnType<typeof getWorkoutSession>>;

/**
 * Obtiene la sesión activa (IN_PROGRESS) del usuario, opcionalmente para un día específico.
 */
export async function getActiveWorkoutSession(userId: string, workoutDayId?: string) {
  return prisma.workoutSession.findFirst({
    where: {
      userId,
      status: "IN_PROGRESS",
      ...(workoutDayId ? { workoutDayId } : {}),
    },
    include: {
      workoutDay: {
        select: {
          id: true,
          dayOfWeek: true,
          dayName: true,
          title: true,
        },
      },
    },
    orderBy: {
      startedAt: "desc",
    },
  });
}

/**
 * Obtiene el detalle completo de una sesión asegurando que pertenezca al usuario autenticado.
 */
export async function getWorkoutSession(sessionId: string, userId: string) {
  const session = await prisma.workoutSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
    include: {
      workoutDay: {
        include: {
          plan: {
            select: {
              name: true,
              notes: true,
            },
          },
          exercises: {
            orderBy: { order: "asc" },
            include: {
              exercise: true,
            },
          },
        },
      },
      sets: {
        orderBy: [
          { workoutDayExerciseId: "asc" },
          { setNumber: "asc" },
        ],
      },
    },
  });

  return session;
}

/**
 * Inicia una nueva sesión de entrenamiento para el usuario, o devuelve la sesión activa existente.
 */
export async function createOrGetActiveSession(userId: string, workoutDayId: string) {
  // Validar que el día de entrenamiento pertenezca al plan del usuario
  const workoutDay = await prisma.workoutDay.findFirst({
    where: {
      id: workoutDayId,
      plan: {
        userId,
      },
    },
  });

  if (!workoutDay) {
    throw new Error("El día de entrenamiento no existe o no pertenece a tu plan.");
  }

  // Buscar si ya existe una sesión en progreso para este día
  const existingActive = await prisma.workoutSession.findFirst({
    where: {
      userId,
      workoutDayId,
      status: "IN_PROGRESS",
    },
  });

  if (existingActive) {
    return existingActive;
  }

  // Crear nueva sesión
  return prisma.workoutSession.create({
    data: {
      userId,
      workoutDayId,
      status: "IN_PROGRESS",
      startedAt: new Date(),
    },
  });
}

/**
 * Registra una serie completada dentro de una sesión activa.
 */
export async function recordWorkoutSet(
  userId: string,
  sessionId: string,
  data: {
    workoutDayExerciseId: string;
    setNumber: number;
    repsCompleted?: number | null;
    weightKg?: number | null;
    durationSeconds?: number | null;
  }
) {
  // Validar propiedad de la sesión y estado
  const session = await prisma.workoutSession.findFirst({
    where: {
      id: sessionId,
      userId,
      status: "IN_PROGRESS",
    },
    include: {
      workoutDay: {
        include: {
          exercises: true,
        },
      },
    },
  });

  if (!session) {
    throw new Error("Sesión no encontrada o ya finalizada.");
  }

  // Validar que el ejercicio pertenezca al día de la sesión
  const validExercise = session.workoutDay.exercises.some(
    (e) => e.id === data.workoutDayExerciseId
  );

  if (!validExercise) {
    throw new Error("El ejercicio no pertenece a esta sesión de entrenamiento.");
  }

  // Crear el registro de la serie
  return prisma.workoutSet.create({
    data: {
      workoutSessionId: sessionId,
      workoutDayExerciseId: data.workoutDayExerciseId,
      setNumber: data.setNumber,
      repsCompleted: data.repsCompleted,
      weightKg: data.weightKg,
      durationSeconds: data.durationSeconds,
      completedAt: new Date(),
    },
  });
}

/**
 * Elimina una serie registrada por error.
 */
export async function removeWorkoutSet(
  userId: string,
  sessionId: string,
  setId: string
) {
  const session = await prisma.workoutSession.findFirst({
    where: {
      id: sessionId,
      userId,
      status: "IN_PROGRESS",
    },
  });

  if (!session) {
    throw new Error("Sesión no encontrada o ya finalizada.");
  }

  const workoutSet = await prisma.workoutSet.findFirst({
    where: {
      id: setId,
      workoutSessionId: sessionId,
    },
  });

  if (!workoutSet) {
    throw new Error("Serie no encontrada.");
  }

  return prisma.workoutSet.delete({
    where: { id: setId },
  });
}

/**
 * Finaliza la sesión de entrenamiento y guarda notas generales si las hay.
 */
export async function completeWorkoutSession(
  userId: string,
  sessionId: string,
  notes?: string | null
) {
  const session = await prisma.workoutSession.findFirst({
    where: {
      id: sessionId,
      userId,
      status: "IN_PROGRESS",
    },
  });

  if (!session) {
    throw new Error("Sesión no encontrada o ya finalizada.");
  }

  return prisma.workoutSession.update({
    where: { id: sessionId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      notes: notes?.trim() || null,
    },
  });
}

/**
 * Cancela una sesión de entrenamiento activa.
 */
export async function cancelWorkoutSession(userId: string, sessionId: string) {
  const session = await prisma.workoutSession.findFirst({
    where: {
      id: sessionId,
      userId,
      status: "IN_PROGRESS",
    },
  });

  if (!session) {
    throw new Error("Sesión no encontrada o ya finalizada.");
  }

  return prisma.workoutSession.update({
    where: { id: sessionId },
    data: {
      status: "CANCELLED",
      completedAt: new Date(),
    },
  });
}

/**
 * Obtiene el historial de entrenamientos completados de un usuario (aislamiento estricto).
 */
export async function getUserCompletedSessions(
  userId: string,
  limit = 30,
  offset = 0
) {
  return prisma.workoutSession.findMany({
    where: {
      userId,
      status: "COMPLETED",
    },
    include: {
      workoutDay: {
        select: {
          id: true,
          dayOfWeek: true,
          dayName: true,
          title: true,
        },
      },
      sets: {
        include: {
          workoutDayExercise: {
            include: {
              exercise: {
                select: {
                  name: true,
                  muscleGroup: true,
                },
              },
            },
          },
        },
        orderBy: {
          completedAt: "asc",
        },
      },
    },
    orderBy: {
      startedAt: "desc",
    },
    take: limit,
    skip: offset,
  });
}
