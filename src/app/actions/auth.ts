"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME, createSessionToken, getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const loginSchema = z.object({
  slug: z.enum(["el", "ella"]),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "El nombre visible no puede estar vacío.")
    .max(50, "El nombre no puede exceder 50 caracteres."),
  unitPreference: z.enum(["kg", "lb"]),
  generalGoal: z
    .string()
    .trim()
    .max(200, "El objetivo no puede exceder 200 caracteres.")
    .optional(),
});


export type ActionState = {
  success?: boolean;
  error?: string;
};

export async function loginAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    slug: formData.get("slug"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Datos inválidos." };
  }


  const { slug, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { slug },
  });

  if (!user) {
    return { error: "Perfil no encontrado." };
  }

  // Verificar si la cuenta aún no ha sido aprovisionada con contraseña
  if (!user.passwordHash) {
    return {
      error:
        "Este perfil aún no tiene contraseña configurada. Ejecuta 'npm run setup:users' en la terminal para asignarla.",
    };
  }

  // Verificar bloqueo por intentos fallidos repetidos
  const now = new Date();
  if (user.lockedUntil && user.lockedUntil > now) {
    const remainingMinutes = Math.ceil(
      (user.lockedUntil.getTime() - now.getTime()) / (60 * 1000)
    );
    return {
      error: `Perfil bloqueado temporalmente por demasiados intentos fallidos. Intenta nuevamente en ${remainingMinutes} minuto(s).`,
    };
  }

  // Comparar contraseña con el hash bcrypt
  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    const updatedAttempts = user.failedAttempts + 1;
    const maxAttempts = 5;
    let lockDate: Date | null = null;

    if (updatedAttempts >= maxAttempts) {
      lockDate = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos de bloqueo
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: updatedAttempts,
        lockedUntil: lockDate,
      },
    });

    if (updatedAttempts >= maxAttempts) {
      return {
        error:
          "Has superado el límite de 5 intentos fallidos. El acceso ha sido bloqueado por 15 minutos.",
      };
    }

    return {
      error: `Contraseña incorrecta. Intento ${updatedAttempts} de ${maxAttempts}.`,
    };
  }

  // Restablecer contador de intentos en caso de éxito
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedAttempts: 0,
      lockedUntil: null,
    },
  });

  // Generar token JWT firmado
  const token = await createSessionToken({
    userId: user.id,
    slug: user.slug,
  });

  // Establecer cookie HttpOnly segura
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  });

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}

export async function updateProfileAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  // Verificación estricta en el servidor: nunca confiar en un userId enviado por el cliente
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: "No autorizado. Inicie sesión nuevamente." };
  }

  const rawData = {
    displayName: formData.get("displayName"),
    unitPreference: formData.get("unitPreference"),
    generalGoal: formData.get("generalGoal"),
  };

  const parsed = profileSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Datos de perfil inválidos." };
  }


  const { displayName, unitPreference, generalGoal } = parsed.data;

  // Actualizar exclusivamente el perfil del usuario autenticado
  await prisma.userProfile.upsert({
    where: { userId: currentUser.id },
    create: {
      userId: currentUser.id,
      displayName,
      unitPreference,
      generalGoal: generalGoal || null,
    },
    update: {
      displayName,
      unitPreference,
      generalGoal: generalGoal || null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/perfil");

  return { success: true };
}
