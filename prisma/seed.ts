import { PrismaClient } from "@prisma/client";
import { seedWorkouts } from "./seed-workouts";

const prisma = new PrismaClient();

async function main() {
  // Ensure SystemHealth row
  await prisma.systemHealth.upsert({
    where: { id: 1 },
    update: { checkedAt: new Date() },
    create: { id: 1, status: "healthy", checkedAt: new Date() },
  });

  // Ensure initial user placeholders if they don't exist
  await prisma.user.upsert({
    where: { slug: "el" },
    update: {},
    create: {
      slug: "el",
      name: "Él",
    },
  });

  await prisma.user.upsert({
    where: { slug: "ella" },
    update: {},
    create: {
      slug: "ella",
      name: "Ella",
    },
  });

  // Ensure catalog and personalized workout plans
  await seedWorkouts();

  console.log("Database initialized with default profiles, health status, and weekly workout plans.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
