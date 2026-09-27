import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUserWeeklyPlan, getCurrentDayOfWeek } from "@/lib/workouts";
import {
  ArrowLeft,
  Calendar,
  Dumbbell,
  Coffee,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  HeartPulse,
} from "lucide-react";

export const metadata = {
  title: "Mi Semana — FitCouple",
};

export default async function SemanaPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const plan = await getUserWeeklyPlan(user.id);
  const currentDay = getCurrentDayOfWeek();
  const isHim = user.slug === "el";

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
            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Ir a hoy</span>
          </Link>
        </div>

        {/* Resumen del Plan Semanal */}
        {plan && (
          <header className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Plan Semanal Personalizado
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                7 Días
              </span>
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-slate-100">
                {plan.name}
              </h1>
              {plan.description && (
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {plan.description}
                </p>
              )}
            </div>

            {/* Aviso de salud contextual */}
            <div className="pt-1">
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed flex items-start gap-2.5 ${
                  isHim
                    ? "bg-cyan-950/40 border border-cyan-800/40 text-cyan-200"
                    : "bg-rose-950/40 border border-rose-800/40 text-rose-200"
                }`}
              >
                <HeartPulse
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    isHim ? "text-cyan-400" : "text-rose-400"
                  }`}
                />
                <p>{plan.notes}</p>
              </div>
            </div>
          </header>
        )}

        {/* Lista de los 7 Días de la Semana */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Distribución de la Semana
            </span>
            <span className="text-[11px] text-slate-500">
              Toca un día para ver su rutina
            </span>
          </div>

          <div className="space-y-2.5">
            {plan?.days.map((day) => {
              const isToday = day.dayOfWeek === currentDay;

              return (
                <Link
                  key={day.id}
                  href={`/entrenamiento?dia=${day.dayOfWeek}`}
                  className={`block rounded-2xl p-4 transition-all border group ${
                    isToday
                      ? isHim
                        ? "bg-gradient-to-r from-cyan-950/40 to-slate-900 border-cyan-500/40 ring-1 ring-cyan-500/20 shadow-md"
                        : "bg-gradient-to-r from-rose-950/40 to-slate-900 border-rose-500/40 ring-1 ring-rose-500/20 shadow-md"
                      : "bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isToday
                            ? isHim
                              ? "bg-cyan-500 text-slate-950"
                              : "bg-rose-500 text-slate-950"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {day.dayName.slice(0, 3).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-100 text-sm truncate">
                            {day.dayName}: {day.title}
                          </h3>
                          {isToday && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Hoy
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {day.isRestDay
                            ? "Descanso / Recuperación activa"
                            : `${day.exercises.length} ejercicios planificados`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-300 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <footer className="mt-8 pt-4 border-t border-slate-900 text-center">
        <p className="text-[11px] text-slate-500">
          FitCouple • Plan de {user.profile?.displayName || user.name}
        </p>
      </footer>
    </main>
  );
}
