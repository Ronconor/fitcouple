import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { getUserDayWorkout, getCurrentDayOfWeek } from "@/lib/workouts";
import {
  Dumbbell,
  TrendingUp,
  User as UserIcon,
  LogOut,
  Sparkles,
  Settings,
  CalendarDays,
  Target,
  ArrowRight,
  Coffee,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "Mi Espacio — FitCouple",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const currentDay = getCurrentDayOfWeek();
  const workoutData = await getUserDayWorkout(user.id, currentDay);
  const todayWorkout = workoutData?.day;

  const isHim = user.slug === "el";
  const displayName = user.profile?.displayName || user.name;
  const unit = user.profile?.unitPreference || "kg";
  const generalGoal =
    user.profile?.generalGoal ||
    (isHim
      ? "Fuerza y recomposición corporal"
      : "Glúteos y tonificación sin impacto");

  return (
    <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Barra Superior con Identidad y Cierre de Sesión */}
        <header className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-inner ${
                isHim
                  ? "bg-cyan-950 text-cyan-400 border border-cyan-800/50"
                  : "bg-rose-950 text-rose-400 border border-rose-800/50"
              }`}
            >
              {isHim ? "ÉL" : "ELLA"}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-100 text-sm">
                  {displayName}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {user.slug}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Sesión privada activa</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href="/perfil"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Configurar perfil"
            >
              <Settings className="w-4 h-4" />
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </header>

        {/* Tarjeta de Bienvenida Personalizada */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Bienvenido a tu espacio
            </span>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              Unidad: {unit.toUpperCase()}
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-100">
              ¡Hola, {displayName}! 👋
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Tu plan semanal personalizado está listo y adaptado a tus objetivos.
            </p>
          </div>

          {/* Resumen de Objetivo */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 flex items-start gap-2.5">
            <Target className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="text-slate-400 font-medium">Objetivo actual: </span>
              <span className="text-slate-200 font-semibold">{generalGoal}</span>
            </div>
          </div>
        </section>

        {/* SECCIÓN PRINCIPAL: ENTRENAMIENTO DE HOY (ACTIVO) */}
        {todayWorkout && (
          <section className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4" />
                Hoy: {todayWorkout.dayName}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {todayWorkout.isRestDay ? "Descanso" : "Rutina lista"}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {todayWorkout.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {todayWorkout.isRestDay
                  ? "Día de recuperación muscular y descanso."
                  : `${todayWorkout.exercises.length} ejercicios con mancuernas y peso corporal.`}
              </p>
            </div>

            <Link
              href="/entrenamiento"
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {todayWorkout.isRestDay ? (
                <>
                  <Coffee className="w-4 h-4" />
                  <span>Ver detalles de descanso</span>
                </>
              ) : (
                <>
                  <Dumbbell className="w-4 h-4" />
                  <span>Ver mi entrenamiento de hoy</span>
                </>
              )}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </section>
        )}

        {/* Acciones y Módulos */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tus Módulos
            </span>
          </div>

          {/* Módulo: Mi plan semanal (7 días) */}
          <Link
            href="/semana"
            className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors">
                  Mi plan semanal completo
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Consulta la distribución de Lunes a Domingo.
                </p>
              </div>
            </div>
            <span className="text-slate-500 group-hover:text-slate-300 transition-colors">
              →
            </span>
          </Link>

          {/* Módulo: Mi progreso corporal (Próximamente FC-6) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 opacity-80">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-100 text-sm">
                  Mi progreso corporal
                </h4>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  Próximamente (FC-6)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Seguimiento de peso ({unit}), medidas corporales y cargas.
              </p>
            </div>
          </div>

          {/* Módulo: Configuración del Perfil */}
          <Link
            href="/perfil"
            className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 border border-slate-700">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-100 text-sm group-hover:text-slate-200 transition-colors">
                  Ajustar mi perfil
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cambiar nombre visible y preferencia de unidades.
                </p>
              </div>
            </div>
            <span className="text-slate-500 group-hover:text-slate-300 transition-colors">
              →
            </span>
          </Link>
        </section>
      </div>

      <footer className="mt-8 pt-4 border-t border-slate-900 text-center">
        <p className="text-[11px] text-slate-500">
          FitCouple • Espacio seguro de {displayName}
        </p>
      </footer>
    </main>
  );
}
