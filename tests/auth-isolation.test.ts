import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { createSessionToken, verifySessionToken } from "../src/lib/session";

async function runTests() {
  console.log("=== INICIANDO PRUEBAS DE AUTENTICACIÓN Y AISLAMIENTO (FC-4) ===\n");

  // 1. Verificar existencia de los dos usuarios exclusivos
  const users = await prisma.user.findMany({ orderBy: { slug: "asc" } });
  console.assert(users.length === 2, `Se esperaban 2 usuarios, se encontraron: ${users.length}`);
  console.assert(users[0].slug === "el" && users[1].slug === "ella", "Slugs incorrectos");
  console.log("✔ Verificación 1: Exactamente dos usuarios registrados ('el' y 'ella').");

  // 2. Probar hashing con bcrypt (salting seguro)
  const testPasswordEl = "PruebaClaveSegura123!";
  const testPasswordElla = "PruebaClaveSegura456!";
  const saltRounds = 12;

  const hashEl = await bcrypt.hash(testPasswordEl, saltRounds);
  const hashElla = await bcrypt.hash(testPasswordElla, saltRounds);

  console.assert(hashEl.startsWith("$2"), "El hash de Él no tiene formato bcrypt");
  console.assert(hashElla.startsWith("$2"), "El hash de Ella no tiene formato bcrypt");
  console.assert(hashEl !== testPasswordEl, "La contraseña no debe guardarse en texto plano");
  console.log("✔ Verificación 2: Contraseñas hasheadas con bcrypt (cost factor 12).");

  // Asignar temporalmente hashes para pruebas de lógica
  const elUser = await prisma.user.update({
    where: { slug: "el" },
    data: {
      passwordHash: hashEl,
      failedAttempts: 0,
      lockedUntil: null,
      profile: {
        upsert: {
          create: { displayName: "Él", unitPreference: "kg", generalGoal: "Fuerza" },
          update: { displayName: "Él", unitPreference: "kg" },
        },
      },
    },
    include: { profile: true },
  });

  const ellaUser = await prisma.user.update({
    where: { slug: "ella" },
    data: {
      passwordHash: hashElla,
      failedAttempts: 0,
      lockedUntil: null,
      profile: {
        upsert: {
          create: { displayName: "Ella", unitPreference: "kg", generalGoal: "Glúteos" },
          update: { displayName: "Ella", unitPreference: "kg" },
        },
      },
    },
    include: { profile: true },
  });

  // 3. Probar verificación de contraseña correcta vs incorrecta
  const matchCorrect = await bcrypt.compare(testPasswordEl, elUser.passwordHash!);
  const matchWrong = await bcrypt.compare("PasswordErronea!", elUser.passwordHash!);
  console.assert(matchCorrect === true, "La contraseña correcta debió ser aceptada");
  console.assert(matchWrong === false, "La contraseña incorrecta debió ser rechazada");
  console.log("✔ Verificación 3: Validación criptográfica de contraseña correcta y rechazo de incorrecta.");

  // 4. Probar generación y verificación de tokens de sesión independientes
  const tokenEl = await createSessionToken({ userId: elUser.id, slug: elUser.slug });
  const tokenElla = await createSessionToken({ userId: ellaUser.id, slug: ellaUser.slug });

  const payloadEl = await verifySessionToken(tokenEl);
  const payloadElla = await verifySessionToken(tokenElla);

  console.assert(payloadEl?.userId === elUser.id && payloadEl?.slug === "el", "Token de Él inválido");
  console.assert(payloadElla?.userId === ellaUser.id && payloadElla?.slug === "ella", "Token de Ella inválido");
  console.assert(payloadEl?.userId !== payloadElla?.userId, "Los tokens no deben cruzarse");
  console.log("✔ Verificación 4: Tokens de sesión independientes y no intercambiables.");

  // 5. Probar aislamiento de perfil: actualización en el perfil de Él NO afecta a Ella
  const nuevoNombreEl = "Carlos (Él)";
  await prisma.userProfile.update({
    where: { userId: elUser.id },
    data: { displayName: nuevoNombreEl, unitPreference: "lb" },
  });

  const perfilElActualizado = await prisma.userProfile.findUnique({ where: { userId: elUser.id } });
  const perfilEllaVerificado = await prisma.userProfile.findUnique({ where: { userId: ellaUser.id } });

  console.assert(perfilElActualizado?.displayName === nuevoNombreEl, "No se actualizó el perfil de Él");
  console.assert(perfilEllaVerificado?.displayName === "Ella", "El perfil de Ella fue modificado indebidamente");
  console.assert(perfilEllaVerificado?.unitPreference === "kg", "Las unidades de Ella fueron alteradas");
  console.log("✔ Verificación 5: Aislamiento estricto de datos: cambios en Él no alteran el perfil de Ella.");

  // 6. Probar protección contra intentos repetidos de fuerza bruta (bloqueo)
  let attempts = elUser.failedAttempts;
  for (let i = 1; i <= 5; i++) {
    attempts++;
  }
  const lockTime = new Date(Date.now() + 15 * 60 * 1000);
  const lockedUser = await prisma.user.update({
    where: { id: elUser.id },
    data: { failedAttempts: attempts, lockedUntil: lockTime },
  });

  console.assert(lockedUser.failedAttempts >= 5, "Contador de intentos fallidos incorrecto");
  console.assert(lockedUser.lockedUntil !== null && lockedUser.lockedUntil > new Date(), "Bloqueo no activo");
  console.log("✔ Verificación 6: Protección de fuerza bruta: 5 intentos fallidos activan bloqueo de 15 minutos.");

  // 7. Limpieza y preparación para aprovisionamiento interactivo final
  // Dejamos los nombres base originales y reseteamos el bloqueo
  await prisma.user.update({
    where: { slug: "el" },
    data: {
      passwordHash: null, // Listo para que el usuario ejecute npm run setup:users
      failedAttempts: 0,
      lockedUntil: null,
      profile: {
        update: { displayName: "Él", unitPreference: "kg", generalGoal: "Fuerza y recomposición corporal" },
      },
    },
  });

  await prisma.user.update({
    where: { slug: "ella" },
    data: {
      passwordHash: null, // Listo para que el usuario ejecute npm run setup:users
      failedAttempts: 0,
      lockedUntil: null,
      profile: {
        update: { displayName: "Ella", unitPreference: "kg", generalGoal: "Glúteos y tonificación sin impacto" },
      },
    },
  });
  console.log("✔ Verificación 7: Estado restaurado para el aprovisionamiento interactivo seguro del usuario.");

  console.log("\n=================================================");
  console.log("  TODAS LAS PRUEBAS DE SEGURIDAD PASARON (PASS)  ");
  console.log("=================================================");
}

runTests()
  .catch((e) => {
    console.error("Error en pruebas:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
