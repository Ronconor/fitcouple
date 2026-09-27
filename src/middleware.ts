import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(COOKIE_NAME);

  let isAuthenticated = false;
  if (sessionCookie?.value) {
    const payload = await verifySessionToken(sessionCookie.value);
    if (payload?.userId) {
      isAuthenticated = true;
    }
  }

  // Rutas que requieren autenticación obligatoria
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/perfil") ||
    pathname.startsWith("/entrenamiento") ||
    pathname.startsWith("/semana") ||
    pathname.startsWith("/historial") ||
    pathname.startsWith("/api/user");

  // Si intenta entrar a una ruta protegida sin estar autenticado -> redirigir a /login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Si ya está autenticado e intenta entrar a /login -> redirigir a /dashboard
  if (pathname === "/login" && isAuthenticated) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/perfil/:path*",
    "/entrenamiento/:path*",
    "/semana/:path*",
    "/historial/:path*",
    "/api/user/:path*",
    "/login",
  ],
};
