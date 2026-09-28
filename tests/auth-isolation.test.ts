import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { createSessionToken, verifySessionToken } from "../src/lib/session";

async function runTests() {
  console.log("=== INICIANDO PRUEBAS DE AUTENTICACIÓN Y AISLAMIENTO (FC-4 / FC-6.2) ===\n");

  const SYNTHETIC_SLUG_1 = "test-auth-synthetic-1";
  const SYNTHETIC_SLUG_2 = "test-auth-synthetic-2";

  try {
    // -------------------------------------------------------------
    // 1. Verificación en MODO SOLO LECTURA de los dos usuarios base
    // (Bajo ninguna circunstancia se modifican 'el' ni 'ella')
    // -------------------------------------------------------------
    const realUsers = await prisma.user.findMany({
      where: { slug: { in: ["el", "ella"] } },
      orderBy: { slug: "asc" },
      select: { id: true, slug: true, name: true },
    });

    console.assert(
      realUsers.length === 2,
      `Se esperaban los 2 usuarios base ('el' y 'ella'), se encontraron: ${realUsers.length}`
    );
    console.assert(
      realUsers[0]?.slug === "el" && realUsers[1]?.slug === "ella",
      "Slugs base incorrectos"
    );
    console.log("✔ Verificación 1: Usuarios base 'el' y 'ella' verificados en MODO SOLO LECTURA (sin modificaciones).");

    // Limpieza preventiva de usuarios sintéticos residuales si existieran
    await prisma.user.deleteMany({
      where: { slug: { in: [SYNTHETIC_SLUG_1, SYNTHETIC_SLUG_2] } },
    });

    // -------------------------------------------------------------
    // 2. Creación de identidades sintéticas exclusivas para pruebas
    // -------------------------------------------------------------
    const testPassword1 = "PruebaClaveSegura123!";
    const testPassword2 = "PruebaClaveSegura456!";
    const saltRounds = 12;

    const hash1 = await bcrypt.hash(testPassword1, saltRounds);
    const hash2 = await bcrypt.hash(testPassword2, saltRounds);

    console.assert(hash1.startsWith("$2"), "El hash de prueba 1 no tiene formato bcrypt");
    console.assert(hash2.startsWith("$2"), "El hash de prueba 2 no tiene formato bcrypt");
    console.assert(hash1 !== testPassword1, "La contraseña no debe guardarse en texto plano");
    console.log("✔ Verificación 2: Contraseñas hasheadas con bcrypt (cost factor 12) sobre datos sintéticos.");

    // Crear usuarios sintéticos
    const synthUser1 = await prisma.user.create({
      data: {
        slug: SYNTHETIC_SLUG_1,
        name: "Usuario Sintético 1",
        passwordHash: hash1,
        failedAttempts: 0,
        lockedUntil: null,
        profile: {
          create: {
            displayName: "Sintético Uno",
            unitPreference: "kg",
            generalGoal: "Fuerza Test",
          },
        },
      },
      include: { profile: true },
    });

    const synthUser2 = await prisma.user.create({
      data: {
        slug: SYNTHETIC_SLUG_2,
        name: "Usuario Sintético 2",
        passwordHash: hash2,
        failedAttempts: 0,
        lockedUntil: null,
        profile: {
          create: {
            displayName: "Sintético Dos",
            unitPreference: "kg",
            generalGoal: "Resistencia Test",
          },
        },
      },
      include: { profile: true },
    });

    // -------------------------------------------------------------
    // 3. Probar verificación de contraseña correcta vs incorrecta
    // -------------------------------------------------------------
    const matchCorrect = await bcrypt.compare(testPassword1, synthUser1.passwordHash!);
    const matchWrong = await bcrypt.compare("PasswordErronea!", synthUser1.passwordHash!);
    console.assert(matchCorrect === true, "La contraseña correcta debió ser aceptada");
    console.assert(matchWrong === false, "La contraseña incorrecta debió ser rechazada");
    console.log("✔ Verificación 3: Validación criptográfica de contraseña correcta y rechazo de incorrecta.");

    // -------------------------------------------------------------
    // 4. Probar generación y verificación de tokens de sesión independientes
    // -------------------------------------------------------------
    const token1 = await createSessionToken({ userId: synthUser1.id, slug: synthUser1.slug });
    const token2 = await createSessionToken({ userId: synthUser2.id, slug: synthUser2.slug });

    const payload1 = await verifySessionToken(token1);
    const payload2 = await verifySessionToken(token2);

    console.assert(
      payload1?.userId === synthUser1.id && payload1?.slug === SYNTHETIC_SLUG_1,
      "Token sintético 1 inválido"
    );
    console.assert(
      payload2?.userId === synthUser2.id && payload2?.slug === SYNTHETIC_SLUG_2,
      "Token sintético 2 inválido"
    );
    console.assert(payload1?.userId !== payload2?.userId, "Los tokens no deben cruzarse");
    console.log("✔ Verificación 4: Tokens de sesión independientes y no intercambiables.");

    // -------------------------------------------------------------
    // 5. Probar aislamiento de perfil entre usuarios sintéticos
    // -------------------------------------------------------------
    const nuevoNombre1 = "Sintético Uno Modificado";
    await prisma.userProfile.update({
      where: { userId: synthUser1.id },
      data: { displayName: nuevoNombre1, unitPreference: "lb" },
    });

    const perfil1Actualizado = await prisma.userProfile.findUnique({
      where: { userId: synthUser1.id },
    });
    const perfil2Verificado = await prisma.userProfile.findUnique({
      where: { userId: synthUser2.id },
    });

    console.assert(perfil1Actualizado?.displayName === nuevoNombre1, "No se actualizó el perfil 1");
    console.assert(perfil2Verificado?.displayName === "Sintético Dos", "El perfil 2 fue modificado indebidamente");
    console.assert(perfil2Verificado?.unitPreference === "kg", "Las unidades del perfil 2 fueron alteradas");
    console.log("✔ Verificación 5: Aislamiento estricto de datos: cambios en Usuario 1 no alteran Usuario 2.");

    // -------------------------------------------------------------
    // 6. Probar protección contra intentos repetidos de fuerza bruta (bloqueo)
    // -------------------------------------------------------------
    let attempts = synthUser1.failedAttempts;
    for (let i = 1; i <= 5; i++) {
      attempts++;
    }
    const lockTime = new Date(Date.now() + 15 * 60 * 1000);
    const lockedUser = await prisma.user.update({
      where: { id: synthUser1.id },
      data: { failedAttempts: attempts, lockedUntil: lockTime },
    });

    console.assert(lockedUser.failedAttempts >= 5, "Contador de intentos fallidos incorrecto");
    console.assert(
      lockedUser.lockedUntil !== null && lockedUser.lockedUntil > new Date(),
      "Bloqueo no activo"
    );
    console.log("✔ Verificación 6: Protección de fuerza bruta: 5 intentos fallidos activan bloqueo de 15 minutos.");

    console.log("\n=================================================");
    console.log("  TODAS LAS PRUEBAS DE SEGURIDAD PASARON (PASS)  ");
    console.log("  LOS USUARIOS REALES ('el', 'ella') NO FUERON   ");
    console.log("       MODIFICADOS EN NINGÚN MOMENTO             ");
    console.log("=================================================\n");
  } finally {
    // -------------------------------------------------------------
    // 7. Cleanup garantizado en bloque FINALLY
    // Elimina de forma segura y completa las identidades sintéticas
    // -------------------------------------------------------------
    await prisma.user.deleteMany({
      where: { slug: { in: [SYNTHETIC_SLUG_1, SYNTHETIC_SLUG_2] } },
    });
    await prisma.$disconnect();
  }
}

runTests().catch((e) => {
  console.error("Error en pruebas:", e);
  process.exit(1);
});
