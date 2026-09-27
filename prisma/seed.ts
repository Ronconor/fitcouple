import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Ensure SystemHealth row
  await prisma.systemHealth.upsert({
    where: { id: 1 },
    update: { checkedAt: new Date() },
    create: { id: 1, status: "healthy", checkedAt: new Date() },
  });

  // Ensure initial profile placeholders
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

  console.log("Database initialized with default profiles and health status.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
