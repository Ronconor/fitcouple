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

export function getCurrentDayOfWeek(): number {
  // JavaScript getDay(): 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  // En nuestro esquema: 1 = Lunes, 2 = Martes, ..., 6 = Sábado, 7 = Domingo
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 7 : jsDay;
}
