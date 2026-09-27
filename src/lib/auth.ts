import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME, verifySessionToken } from "./session";

export { COOKIE_NAME, createSessionToken, verifySessionToken } from "./session";
export type { SessionPayload } from "./session";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  const payload = await verifySessionToken(sessionCookie.value);
  if (!payload?.userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      slug: true,
      name: true,
      failedAttempts: true,
      lockedUntil: true,
      profile: {
        select: {
          id: true,
          displayName: true,
          unitPreference: true,
          generalGoal: true,
          updatedAt: true,
        },
      },
    },
  });

  return user;
}
