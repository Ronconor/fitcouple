import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  Dumbbell,
  TrendingUp,
  HeartPulse,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1;`;
    return { connected: true };
  } catch {
    return { connected: false };
  }
}

export default async function HomePage() {
  const [dbStatus, currentUser] = await Promise.all([
    checkDatabaseConnection(),
    getCurrentUser(),
  ]);

  return (
    <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 flex flex-col justify-between">
      {/* Encabezado y Marca */}
      <header className="space-y-3 text-center pt-2">
        <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Espacio Privado en Pareja</span>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            FitCouple
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Entrenamos juntos. Progresamos a nuestro ritmo.
          </p>
        </div>

        {/* Indicador de Conexión de Infraestructura */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-slate-900 border border-slate-800">
          {dbStatus.connected ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-slate-300">Base de datos local conectada</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-amber-300">Conexión DB en espera</span>
            </>
          )}
        </div>
      </header>

      {/* Si hay sesión activa: botón directo a su espacio */}
      {currentUser ? (
        <section className="my-6 p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 text-center shadow-lg">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 text-xs font-medium border border-cyan-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sesión activa: {currentUser.profile?.displayName || currentUser.name}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-100">
            Bienvenido de nuevo
          </h2>
          <Link
            href="/dashboard"
            className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Ir a mi espacio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      ) : (
        /* Si NO hay sesión activa: mostrar los dos perfiles y botón de login */
        <section className="my-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Dos Perfiles Privados
            </span>
            <span className="text-[11px] text-slate-500 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
              Protegidos con Contraseña
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Tarjeta Informativa: Él */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/70 border border-cyan-800/40 text-cyan-400 flex items-center justify-center text-lg font-bold mb-2">
                ÉL
              </div>
              <span className="font-semibold text-slate-200 text-sm">Perfil de Él</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Fuerza & Recomposición</span>
              <div className="mt-2.5 inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Acceso privado</span>
              </div>
            </div>

            {/* Tarjeta Informativa: Ella */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-rose-950/70 border border-rose-800/40 text-rose-400 flex items-center justify-center text-lg font-bold mb-2">
                ELLA
              </div>
              <span className="font-semibold text-slate-200 text-sm">Perfil de Ella</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Glúteos & Tonificación</span>
              <div className="mt-2.5 inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Acceso privado</span>
              </div>
            </div>
          </div>

          {/* Botón Principal de Acceso */}
          <Link
            href="/login"
            className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Iniciar Sesión para Entrenar</span>
          </Link>
        </section>
      )}

      {/* Módulos Visuales (Próximamente) */}
      <section className="space-y-3">
        {/* Acción: Mi entrenamiento de hoy */}
        <div className="relative overflow-hidden bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-100 text-sm">
                  Mi entrenamiento de hoy
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Próximamente
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Rutina individual, descansos y registro de cargas.
              </p>
            </div>
          </div>
        </div>

        {/* Acción: Mi progreso */}
        <div className="relative overflow-hidden bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-100 text-sm">
                  Mi progreso corporal
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  Próximamente
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evolución de peso, medidas y progreso de fuerza.
              </p>
            </div>
          </div>
        </div>

        {/* Equipamiento compartido */}
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-3.5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-emerald-400" />
            <span>Kit de 20 kg (Mancuernas + Conector)</span>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">En casa</span>
        </div>
      </section>

      {/* Pie de página */}
      <footer className="mt-8 pt-4 border-t border-slate-900 text-center">
        <p className="text-[11px] text-slate-500">
          FitCouple • Aplicación privada de uso doméstico
        </p>
      </footer>
    </main>
  );
}
