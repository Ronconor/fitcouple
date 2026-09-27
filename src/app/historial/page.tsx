import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUserCompletedSessions } from "@/lib/sessions";
import { HistorySessionCard } from "@/components/workouts/HistorySessionCard";
import { UnitPreference } from "@/lib/units";
import {
  ArrowLeft,
  History,
  Dumbbell,
  Sparkles,
  Trophy,
  CalendarDays,
  Plus,
} from "lucide-react";

export const metadata = {
  title: "Mi Historial — FitCouple",
};

interface HistorialPageProps {
  searchParams: Promise<{ celebrate?: string }>;
}

export default async function HistorialPage({ searchParams }: HistorialPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const isCelebration = resolvedParams.celebrate === "1";

  const sessions = await getUserCompletedSessions(user.id, 50);

  const isHim = user.slug === "el";
  const displayName = user.profile?.displayName || user.name;
  const unit = (user.profile?.unitPreference as UnitPreference) || "kg";

  // Estadísticas básicas
  const totalCompleted = sessions.length;
  const totalSets = sessions.reduce((acc, s) => acc + s.sets.length, 0);

  return (
    <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 flex flex-col justify-between">
      <div className="space-y-5">
        {/* Cabecera y Navegación */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Mi espacio</span>
          </Link>

          <Link
            href="/entrenamiento"
            className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Ir a entrenar</span>
          </Link>
        </div>

        {/* Banner de Celebración si acaba de finalizar */}
        {isCelebration && (
          <div className="bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border border-emerald-500/50 rounded-3xl p-4 text-center space-y-1.5 shadow-lg animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-md">
              <Trophy className="w-5 h-5 font-bold" />
            </div>
            <h3 className="font-black text-slate-100 text-base">
              ¡Entrenamiento Guardado con Éxito! 🎉
            </h3>
            <p className="text-xs text-emerald-200">
              Excelente constancia, {displayName}. Tu progreso quedó registrado en tu historial personal.
            </p>
          </div>
        )}

        {/* Tarjeta de Resumen del Historial */}
        <header className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              Historial de Entrenamientos
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isHim
                  ? "bg-cyan-950 text-cyan-400 border border-cyan-800/50"
                  : "bg-rose-950 text-rose-400 border border-rose-800/50"
              }`}
            >
              {displayName}
            </span>
          </div>

          <div>
            <h1 className="text-xl font-black text-slate-100">
              Tus Sesiones Completadas
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Registro privado de cada sesión, pesos utilizados y repeticiones logradas.
            </p>
          </div>

          {/* Métricas rápidas */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-center">
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {totalCompleted}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">
                Sesiones realizadas
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 text-center">
              <span className="text-2xl font-black text-cyan-400 font-mono">
                {totalSets}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">
                Series completadas
              </span>
            </div>
          </div>
        </header>

        {/* Lista de Sesiones o Estado Vacío */}
        {sessions.length === 0 ? (
          <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-4 my-4">
            <div className="w-14 h-14 rounded-3xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto border border-slate-700">
              <Dumbbell className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-slate-200 text-base">
                Aún no tienes entrenamientos registrados
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Cuando inicies y finalices una rutina desde tu celular, aquí podrás consultar tus series, repeticiones y cargas utilizadas.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/entrenamiento"
                className="inline-flex items-center gap-2 py-3 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Empezar mi primer entrenamiento</span>
              </Link>
            </div>
          </section>
        ) : (
          <section className="space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Sesiones Anteriores ({totalCompleted})
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Unidades: {unit.toUpperCase()}
              </span>
            </div>

            {sessions.map((session) => (
              <HistorySessionCard
                key={session.id}
                session={session}
                unit={unit}
              />
            ))}
          </section>
        )}
      </div>

      <footer className="mt-8 pt-4 border-t border-slate-900 text-center">
        <p className="text-[11px] text-slate-500">
          FitCouple • Historial personal de {displayName}
        </p>
      </footer>
    </main>
  );
}
