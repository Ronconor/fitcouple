"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  HeartPulse,
  Dumbbell,
  Timer,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { RestTimer } from "./RestTimer";
import { ExerciseSessionCard } from "./ExerciseSessionCard";
import { SessionFooter } from "./SessionFooter";
import { UnitPreference } from "@/lib/units";

interface ActiveSessionViewProps {
  session: {
    id: string;
    startedAt: string | Date;
    status: string;
    workoutDay: {
      dayName: string;
      title: string;
      focusNotes?: string | null;
      exercises: Array<{
        id: string;
        order: number;
        targetSets: number;
        targetReps: string;
        restSeconds: number;
        notes?: string | null;
        alternative?: string | null;
        exercise: {
          id: string;
          name: string;
          muscleGroup: string;
          equipment: string;
          instructions: string;
          commonMistakes: string;
          alternative?: string | null;
          safetyWarning?: string | null;
        };
      }>;
    };
    sets: Array<{
      id: string;
      workoutDayExerciseId: string;
      setNumber: number;
      repsCompleted: number | null;
      weightKg: number | null;
      durationSeconds: number | null;
    }>;
  };
  userSlug: "el" | "ella";
  userName: string;
  unit: UnitPreference;
}

export function ActiveSessionView({
  session,
  userSlug,
  userName,
  unit,
}: ActiveSessionViewProps) {
  const [activeRestSeconds, setActiveRestSeconds] = useState<number>(60);
  const [timerKey, setTimerKey] = useState<number | null>(null);

  const isHim = userSlug === "el";
  const day = session.workoutDay;
  const isCompleted = session.status === "COMPLETED";

  // Callback cuando una serie es registrada
  const handleSetCompleted = (restSeconds: number) => {
    setActiveRestSeconds(restSeconds || 60);
    setTimerKey(Date.now());
  };

  const totalSetsCompleted = session.sets.length;

  return (
    <div className="space-y-5">
      {/* Barra Superior */}
      <div className="flex items-center justify-between">
        <Link
          href="/entrenamiento"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a la rutina</span>
        </Link>

        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              isHim
                ? "bg-cyan-950 text-cyan-400 border border-cyan-800/50"
                : "bg-rose-950 text-rose-400 border border-rose-800/50"
            }`}
          >
            {userName} ({unit.toUpperCase()})
          </span>

          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {isCompleted ? "Completada" : "En Curso"}
          </span>
        </div>
      </div>

      {/* Cabecera del Entrenamiento Activo */}
      <header className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {day.dayName}
          </span>
          <span className="text-xs font-mono text-slate-400">
            {totalSetsCompleted} series registradas
          </span>
        </div>

        <div>
          <h1 className="text-xl font-black text-slate-100">{day.title}</h1>
          {day.focusNotes && (
            <p className="text-xs text-slate-400 mt-1">{day.focusNotes}</p>
          )}
        </div>

        {/* Recordatorio de cuidado físico */}
        <div className="pt-1">
          {isHim ? (
            <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-200 leading-relaxed flex items-start gap-2">
              <HeartPulse className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p>
                <strong>Respiración constante:</strong> Inhala al bajar y exhala con fuerza al empujar la carga.
              </p>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-[11px] text-rose-200 leading-relaxed flex items-start gap-2">
              <HeartPulse className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p>
                <strong>Cuidado articular:</strong> Rango seguro y controlado sin sobrecargar la rodilla.
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Temporizador de Descanso (Sticky o en el tope) */}
      {!isCompleted && (
        <section className="sticky top-2 z-20 shadow-xl backdrop-blur-md">
          <RestTimer initialSeconds={activeRestSeconds} autoStartKey={timerKey} />
        </section>
      )}

      {/* Lista de Ejercicios de la Sesión */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Ejercicios de la Sesión
          </span>
          <span className="text-[11px] text-slate-500">
            Toca registrar en cada serie
          </span>
        </div>

        {day.exercises.map((item) => {
          const loggedSetsForExercise = session.sets.filter(
            (s) => s.workoutDayExerciseId === item.id
          );

          return (
            <ExerciseSessionCard
              key={item.id}
              workoutDayExerciseId={item.id}
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
              loggedSets={loggedSetsForExercise}
              sessionId={session.id}
              unit={unit}
              isReadOnly={isCompleted}
              onSetCompleted={handleSetCompleted}
            />
          );
        })}
      </section>

      {/* Pie con Notas y Finalización */}
      {!isCompleted && (
        <SessionFooter
          sessionId={session.id}
          totalSetsCompleted={totalSetsCompleted}
        />
      )}

      {isCompleted && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
          <p className="text-xs text-emerald-300 font-bold">
            Esta sesión ya fue completada y guardada.
          </p>
          <Link
            href="/historial"
            className="inline-block py-2 px-4 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black"
          >
            Ver en mi historial
          </Link>
        </div>
      )}
    </div>
  );
}
