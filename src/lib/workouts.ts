import { prisma } from "@/lib/prisma";

export async function getUserWeeklyPlan(userId: string) {
  const plan = await prisma.workoutPlan.findUnique({
    where: { userId },
    include: {
      days: {
        orderBy: { dayOfWeek: "asc" },
        include: {
          exercises: {
            orderBy: { order: "asc" },
            include: {
              exercise: true,
            },
          },
        },
      },
    },
  });

  return plan;
}

export async function getUserDayWorkout(userId: string, dayOfWeek: number) {
  const plan = await prisma.workoutPlan.findUnique({
    where: { userId },
    select: {
      id: true,
      name: true,
      notes: true,
      days: {
        where: { dayOfWeek },
        include: {
          exercises: {
            orderBy: { order: "asc" },
            include: {
              exercise: true,
            },
          },
        },
      },
    },
  });

  if (!plan || plan.days.length === 0) {
    return null;
  }

  return {
    planName: plan.name,
    planNotes: plan.notes,
    day: plan.days[0],
  };
}

export function getCurrentDayOfWeek(timeZone: string = "America/Bogota"): number {
  // En nuestro esquema: 1 = Lunes, 2 = Martes, ..., 6 = Sábado, 7 = Domingo
  // Usamos Intl.DateTimeFormat para calcular el día en la zona horaria local (-05:00 Colombia)
  const now = new Date();
  const dayShort = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(now);
  const dayMap: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };
  return dayMap[dayShort] ?? (now.getDay() === 0 ? 7 : now.getDay());
}

