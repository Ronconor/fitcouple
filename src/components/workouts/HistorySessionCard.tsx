"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Dumbbell,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { UnitPreference, formatWeight } from "@/lib/units";

interface HistorySessionCardProps {
  session: {
    id: string;
    startedAt: string | Date;
    completedAt: string | Date | null;
    notes?: string | null;
    workoutDay: {
      dayName: string;
      title: string;
    };
    sets: Array<{
      id: string;
      setNumber: number;
      repsCompleted: number | null;
      weightKg: number | null;
      durationSeconds: number | null;
      workoutDayExercise: {
        exercise: {
          name: string;
          muscleGroup: string;
        };
      };
    }>;
  };
  unit: UnitPreference;
}

export function HistorySessionCard({ session, unit }: HistorySessionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const startDate = new Date(session.startedAt);
  const formattedDate = startDate.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  const formattedTime = startDate.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Duración en minutos
  const durationMinutes = session.completedAt
    ? Math.max(1, Math.round((new Date(session.completedAt).getTime() - startDate.getTime()) / 60000))
    : null;

  // Agrupar series por ejercicio
  const exercisesMap = new Map<
    string,
    {
      name: string;
      muscleGroup: string;
      sets: Array<{
        setNumber: number;
        repsCompleted: number | null;
        weightKg: number | null;
      }>;
    }
  >();

  session.sets.forEach((s) => {
    const exName = s.workoutDayExercise.exercise.name;
    if (!exercisesMap.has(exName)) {
      exercisesMap.set(exName, {
        name: exName,
        muscleGroup: s.workoutDayExercise.exercise.muscleGroup,
        sets: [],
      });
    }
    exercisesMap.get(exName)!.sets.push({
      setNumber: s.setNumber,
      repsCompleted: s.repsCompleted,
      weightKg: s.weightKg,
    });
  });

  const groupedExercises = Array.from(exercisesMap.values());
  const totalSets = session.sets.length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden transition-all shadow-sm">
      {/* Resumen Principal Clicable */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4.5 space-y-3 hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-emerald-400 capitalize flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate} • {formattedTime}
          </span>
          <span className="text-[11px] font-mono font-bold text-slate-400 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
            {durationMinutes ? `${durationMinutes} min` : "Finalizado"}
          </span>
        </div>

        <div>
          <h3 className="font-bold text-slate-100 text-base leading-tight">
            {session.workoutDay.title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {groupedExercises.length} ejercicios • {totalSets} series registradas
          </p>
        </div>

        {session.notes && (
          <div className="flex items-start gap-1.5 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="italic line-clamp-2">&ldquo;{session.notes}&rdquo;</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs text-cyan-400 font-semibold">
          <span>{isExpanded ? "Ocultar desglose" : "Ver detalle de series y pesos"}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Desglose Expandible */}
      {isExpanded && (
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 space-y-3.5 animate-in fade-in duration-200">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Desglose por ejercicio:
          </span>

          <div className="space-y-3">
            {groupedExercises.map((ex, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2 text-xs"
              >
                <div className="flex items-baseline justify-between">
                  <h4 className="font-bold text-slate-200 text-xs">{ex.name}</h4>
                  <span className="text-[10px] text-slate-500">{ex.muscleGroup}</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {ex.sets.map((s) => (
                    <div
                      key={s.setNumber}
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between font-mono text-[11px]"
                    >
                      <span className="text-slate-400">S{s.setNumber}:</span>
                      <span className="text-slate-200 font-bold">
                        {s.repsCompleted} reps
                      </span>
                      <span className="text-emerald-400">
                        {s.weightKg && s.weightKg > 0
                          ? formatWeight(s.weightKg, unit)
                          : "P. corporal"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
