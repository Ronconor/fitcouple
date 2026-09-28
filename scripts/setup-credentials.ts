import readline from "readline";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Captura interactiva segura en consola para Windows y POSIX:
 * - Enmascara cada carácter con '*'
 * - Maneja correctamente Backspace (elimina de memoria y de pantalla)
 * - Ignora secuencias de escape y teclas de control
 * - Trata la contraseña como cadena literal exacta (SIN .trim())
 */
function promptMasked(query: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(query);

    if (!process.stdin.isTTY) {
      // Fallback para entornos no interactivos o pipes
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question("", (answer) => {
        rl.close();
        // Cadena literal sin trim arbitrario
        resolve(answer.replace(/[\r\n]+$/, ""));
      });
      return;
    }

    let password = "";
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\u0003") {
          // Ctrl+C: salir limpiamente restaurando el modo de la terminal
          cleanup();
          process.stdout.write("\n\nOperación cancelada por el usuario.\n");
          process.exit(0);
        } else if (char === "\r" || char === "\n") {
          // Enter: fin de entrada
          cleanup();
          process.stdout.write("\n");
          // Devolver cadena literal exacta (sin eliminar espacios con .trim())
          resolve(password);
          return;
        } else if (char === "\u0008" || char === "\x7f") {
          // Backspace / Delete
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write("\b \b");
          }
        } else if (char.charCodeAt(0) >= 32 && char.charCodeAt(0) <= 126) {
          // Caracteres imprimibles (ASCII 32 a 126)
          password += char;
          process.stdout.write("*");
        }
        // Cualquier otro código de control (flechas, escape) se descarta deliberadamente
      }
    };

    const cleanup = () => {
      process.stdin.removeListener("data", onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
    };

    process.stdin.on("data", onData);
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
    password = await promptMasked(`Ingrese la contraseña para ${defaultName}: `);
    if (!password || password.length < 6) {
      console.log("La contraseña debe tener al menos 6 caracteres. Intente nuevamente.\n");
      continue;
    }

    confirm = await promptMasked(`Confirme la contraseña para ${defaultName}: `);
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
            // Preservar valores existentes del perfil si ya existen
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
  console.log("    (Entrada enmascarada: se muestra como '*')   ");
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
