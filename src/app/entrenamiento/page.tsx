import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUserDayWorkout, getCurrentDayOfWeek } from "@/lib/workouts";
import { getActiveWorkoutSession } from "@/lib/sessions";
import { ExerciseCard } from "@/components/workouts/ExerciseCard";
import { StartWorkoutButton } from "@/components/workouts/StartWorkoutButton";
import {
  ArrowLeft,
  Calendar,
  Coffee,
  HeartPulse,
  Sparkles,
  Info,
  CalendarDays,
  History,
} from "lucide-react";

export const metadata = {
  title: "Entrenamiento — FitCouple",
};

interface EntrenamientoPageProps {
  searchParams: Promise<{ dia?: string }>;
}

export default async function EntrenamientoPage({
  searchParams,
}: EntrenamientoPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const currentDay = getCurrentDayOfWeek();

  const parsedDay = resolvedParams.dia ? parseInt(resolvedParams.dia, 10) : currentDay;
  const selectedDay = isNaN(parsedDay) || parsedDay < 1 || parsedDay > 7 ? currentDay : parsedDay;

  const workoutData = await getUserDayWorkout(user.id, selectedDay);
  const day = workoutData?.day;

  const activeSession = day ? await getActiveWorkoutSession(user.id, day.id) : null;

  const daysNav = [
    { dayOfWeek: 1, label: "L", name: "Lunes" },
    { dayOfWeek: 2, label: "M", name: "Martes" },
    { dayOfWeek: 3, label: "X", name: "Miércoles" },
    { dayOfWeek: 4, label: "J", name: "Jueves" },
    { dayOfWeek: 5, label: "V", name: "Viernes" },
    { dayOfWeek: 6, label: "S", name: "Sábado" },
    { dayOfWeek: 7, label: "D", name: "Domingo" },
  ];

  const isHim = user.slug === "el";
  const isToday = selectedDay === currentDay;

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

          <div className="flex items-center gap-3">
            <Link
              href="/historial"
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>Historial</span>
            </Link>

            <Link
              href="/semana"
              className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Semana</span>
            </Link>
          </div>
        </div>

        {/* Selector Horizontal de los 7 Días */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {isToday ? "Día actual (Hoy)" : "Consultando otro día"}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {daysNav.find((d) => d.dayOfWeek === selectedDay)?.name}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl">
            {daysNav.map((d) => {
              const active = d.dayOfWeek === selectedDay;
              const isRealToday = d.dayOfWeek === currentDay;

              return (
                <Link
                  key={d.dayOfWeek}
                  href={`/entrenamiento?dia=${d.dayOfWeek}`}
                  className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                    active
                      ? isHim
                        ? "bg-cyan-500 text-slate-950 font-bold shadow-md"
                        : "bg-rose-500 text-slate-950 font-bold shadow-md"
                      : isRealToday
                      ? "bg-slate-800 text-emerald-300 border border-emerald-500/40 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <span className="text-xs font-bold leading-none">{d.label}</span>
                  {isRealToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1" />
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Título de la Sesión del Día */}
        {day && (
          <header className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {day.dayName} {isToday && "• Hoy"}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                {day.isRestDay ? "Descanso" : `${day.exercises.length} Ejercicios`}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-100">
                {day.title}
              </h2>
              {day.focusNotes && (
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {day.focusNotes}
                </p>
              )}
            </div>

            {/* Aviso general de salud según el perfil */}
            <div className="pt-1">
              {isHim ? (
                <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-200 leading-relaxed flex items-start gap-2">
                  <HeartPulse className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>Cuidado cardiovascular:</strong> Recuerda respirar de forma continua en cada esfuerzo. No aguantes el aire.
                  </p>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-[11px] text-rose-200 leading-relaxed flex items-start gap-2">
                  <HeartPulse className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>Protección articular:</strong> Sin carrera, sin saltos y sin sentadilla profunda. Movimientos controlados con rango seguro.
                  </p>
                </div>
              )}
            </div>
          </header>
        )}

        {/* Botón de Empezar / Continuar Entrenamiento */}
        {day && !day.isRestDay && (
          <section className="pt-0.5">
            <StartWorkoutButton
              workoutDayId={day.id}
              hasActiveSession={!!activeSession}
              activeSessionId={activeSession?.id}
            />
          </section>
        )}

        {/* Contenido: Si es día de descanso o lista de ejercicios */}
        {day?.isRestDay ? (
          <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-sm my-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-inner">
              <Coffee className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-100">
                Día de Recuperación y Descanso
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                El descanso es fundamental para la asimilación muscular y articular. Hidrátate, aliméntate bien y disfruta el día.
              </p>
            </div>

            {day.exercises.length > 0 && (
              <div className="pt-2 text-left space-y-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Actividad ligera opcional recomendada:
                </span>
                {day.exercises.map((item) => (
                  <ExerciseCard
                    key={item.id}
                    order={item.order}
                    name={item.exercise.name}
                    muscleGroup={item.exercise.muscleGroup}
                    equipment={item.exercise.equipment}
                    targetSets={item.targetSets}
                    targetReps={item.targetReps}
                    restSeconds={item.restSeconds}
                    notes={item.notes}
                    instructions={item.exercise.instructions}
                    commonMistakes={item.exercise.commonMistakes}
                    alternative={item.alternative || item.exercise.alternative}
                    safetyWarning={item.exercise.safetyWarning}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Ejercicios Programados
              </span>
              <span className="text-[11px] text-slate-500">
                Paso a paso con mancuernas
              </span>
            </div>

            {day?.exercises.map((item) => (
              <ExerciseCard
                key={item.id}
                order={item.order}
                name={item.exercise.name}
                muscleGroup={item.exercise.muscleGroup}
                equipment={item.exercise.equipment}
                targetSets={item.targetSets}
                targetReps={item.targetReps}
                restSeconds={item.restSeconds}
                notes={item.notes}
                instructions={item.exercise.instructions}
                commonMistakes={item.exercise.commonMistakes}
                alternative={item.alternative || item.exercise.alternative}
                safetyWarning={item.exercise.safetyWarning}
              />
            ))}
          </section>
        )}
      </div>

      <footer className="mt-8 pt-4 border-t border-slate-900 text-center">
        <p className="text-[11px] text-slate-500">
          FitCouple • Plan de {user.profile?.displayName || user.name}
        </p>
      </footer>
    </main>
  );
}
