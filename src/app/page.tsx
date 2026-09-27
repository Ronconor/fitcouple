import { prisma } from "@/lib/prisma";
import { Dumbbell, TrendingUp, Users, HeartPulse, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

async function checkDatabaseConnection() {
  try {
    const result = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW() as now;`;
    return { connected: true, timestamp: result[0]?.now?.toLocaleTimeString("es-CO") || "ok" };
  } catch (error) {
    return { connected: false, error: (error as Error).message };
  }
}

export default async function HomePage() {
  const dbStatus = await checkDatabaseConnection();

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
              <span className="text-slate-300">PostgreSQL Docker activo</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-amber-300">Conexión DB en espera</span>
            </>
          )}
        </div>
      </header>

      {/* Selector Visual de Perfil (Provisional / No autenticado) */}
      <section className="my-6 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            ¿Quién entrena hoy?
          </span>
          <span className="text-[11px] text-slate-500 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
            Perfiles Locales
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Tarjeta de Perfil: Él */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col items-center text-center transition-all shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/70 border border-cyan-800/40 text-cyan-400 flex items-center justify-center text-xl font-bold mb-3 shadow-inner">
              ÉL
            </div>
            <span className="font-semibold text-slate-200 text-base">Él</span>
            <span className="text-xs text-slate-400 mt-0.5">Fuerza & Recomposición</span>
            <div className="mt-3 w-full">
              <span className="inline-block w-full py-1 text-[11px] font-medium text-slate-500 bg-slate-950 rounded-lg border border-slate-800/80">
                Perfil listo
              </span>
            </div>
          </div>

          {/* Tarjeta de Perfil: Ella */}
          <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col items-center text-center transition-all shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-rose-950/70 border border-rose-800/40 text-rose-400 flex items-center justify-center text-xl font-bold mb-3 shadow-inner">
              ELLA
            </div>
            <span className="font-semibold text-slate-200 text-base">Ella</span>
            <span className="text-xs text-slate-400 mt-0.5">Glúteos & Tonificación</span>
            <div className="mt-3 w-full">
              <span className="inline-block w-full py-1 text-[11px] font-medium text-slate-500 bg-slate-950 rounded-lg border border-slate-800/80">
                Perfil listo
              </span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-center text-slate-500 italic pt-1">
          * La autenticación individual segura se configurará en las siguientes fases.
        </p>
      </section>

      {/* Accesos Rápidos Principales (Móvil-First, Botones Grandes) */}
      <section className="space-y-3">
        {/* Acción: Mi entrenamiento de hoy */}
        <div className="relative group overflow-hidden bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20 rounded-2xl p-4 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-100 text-base">
                  Mi entrenamiento de hoy
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Próximamente
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Rutina adaptada, guía visual de técnica y registro de series.
              </p>
            </div>
          </div>
        </div>

        {/* Acción: Mi progreso */}
        <div className="relative group overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-4 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-100 text-base">
                  Mi progreso corporal
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  Próximamente
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Historial de peso, medidas clave y evolución de cargas.
              </p>
            </div>
          </div>
        </div>

        {/* Acción: Equipamiento compartido */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-emerald-400" />
            <span>Kit de 20 kg (Mancuernas + Conector)</span>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">En casa</span>
        </div>
      </section>

      {/* Pie de página con aviso de privacidad */}
      <footer className="mt-8 pt-4 border-t border-slate-900 text-center">
        <p className="text-[11px] text-slate-500">
          FitCouple • Aplicación privada de uso doméstico
        </p>
      </footer>
    </main>
  );
}
