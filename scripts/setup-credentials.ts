import readline from "readline";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function promptHidden(query: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const stdin = process.stdin;
    process.stdout.write(query);

    // Mute stdout while typing to avoid echoing password to screen/logs
    let muted = true;
    const oldWrite = process.stdout.write;
    process.stdout.write = (chunk: any, encoding?: any, cb?: any) => {
      if (!muted) {
        return oldWrite.call(process.stdout, chunk, encoding, cb);
      }
      return true;
    };

    rl.question("", (answer) => {
      muted = false;
      process.stdout.write = oldWrite;
      process.stdout.write("\n");
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function configureUser(slug: string, defaultName: string, defaultGoal: string) {
  const user = await prisma.user.findUnique({
    where: { slug },
    include: { profile: true },
  });

  if (!user) {
    console.error(`Error: Usuario con slug "${slug}" no encontrado.`);
    return false;
  }

  console.log(`\n--- Configurando credenciales para: ${defaultName} (${slug}) ---`);

  let password = "";
  let confirm = "";

  while (true) {
    password = await promptHidden(`Ingrese la contraseña para ${defaultName}: `);
    if (!password || password.length < 6) {
      console.log("La contraseña debe tener al menos 6 caracteres. Intente nuevamente.");
      continue;
    }

    confirm = await promptHidden(`Confirme la contraseña para ${defaultName}: `);
    if (password !== confirm) {
      console.log("Las contraseñas no coinciden. Intente nuevamente.\n");
      continue;
    }

    break;
  }

  const saltRounds = 12;
  const hash = await bcrypt.hash(password, saltRounds);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hash,
      failedAttempts: 0,
      lockedUntil: null,
      profile: {
        upsert: {
          create: {
            displayName: defaultName,
            unitPreference: "kg",
            generalGoal: defaultGoal,
          },
          update: {
            // Keep existing values if profile exists
          },
        },
      },
    },
  });

  console.log(`✔ Contraseña y perfil configurados correctamente para ${defaultName}.`);
  return true;
}

async function main() {
  console.log("=================================================");
  console.log("       FitCouple — Asignación de Credenciales     ");
  console.log("  (Entrada oculta: los caracteres no se imprimen) ");
  console.log("=================================================");

  try {
    await configureUser("el", "Él", "Fuerza y recomposición corporal");
    await configureUser("ella", "Ella", "Glúteos y tonificación sin impacto");

    console.log("\n=================================================");
    console.log("✔ Proceso finalizado. Ambos perfiles tienen hash seguro.");
    console.log("=================================================\n");
  } catch (error) {
    console.error("Error durante la configuración:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
