"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Dumbbell,
  CheckCircle2,
  Trash2,
  Plus,
  Minus,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";
import { recordSetAction, removeSetAction } from "@/app/actions/workouts";
import { UnitPreference, kgToDisplay, formatWeight } from "@/lib/units";

interface LoggedSet {
  id: string;
  setNumber: number;
  repsCompleted: number | null;
  weightKg: number | null;
  durationSeconds: number | null;
}

interface ExerciseSessionCardProps {
  workoutDayExerciseId: string;
  order: number;
  name: string;
  muscleGroup: string;
  equipment: string;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  notes?: string | null;
  instructions: string;
  commonMistakes: string;
  alternative?: string | null;
  safetyWarning?: string | null;
  loggedSets: LoggedSet[];
  sessionId: string;
  unit: UnitPreference;
  isReadOnly?: boolean;
  onSetCompleted?: (restSeconds: number) => void;
}

export function ExerciseSessionCard({
  workoutDayExerciseId,
  order,
  name,
  muscleGroup,
  equipment,
  targetSets,
  targetReps,
  restSeconds,
  notes,
  instructions,
  commonMistakes,
  alternative,
  safetyWarning,
  loggedSets,
  sessionId,
  unit,
  isReadOnly = false,
  onSetCompleted,
}: ExerciseSessionCardProps) {
  const [showTechnique, setShowTechnique] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingSetId, setDeletingSetId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Determinar siguiente número de serie
  const nextSetNumber = loggedSets.length + 1;
  const isAllTargetSetsDone = loggedSets.length >= targetSets;

  // Valores iniciales predeterminados para la siguiente serie (basado en la última serie registrada o target)
  const lastSet = loggedSets[loggedSets.length - 1];
  const parsedTargetReps = parseInt(targetReps.split("-")[0] || "10", 10);
  const defaultReps = lastSet?.repsCompleted ?? (isNaN(parsedTargetReps) ? 10 : parsedTargetReps);
  const defaultWeight = lastSet?.weightKg !== null && lastSet?.weightKg !== undefined
    ? (kgToDisplay(lastSet.weightKg, unit) ?? 0)
    : 0;

  const [inputReps, setInputReps] = useState<number>(defaultReps);
  const [inputWeight, setInputWeight] = useState<number>(defaultWeight);

  const handleRecordSet = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const res = await recordSetAction({
        sessionId,
        workoutDayExerciseId,
        setNumber: nextSetNumber,
        repsCompleted: inputReps,
        enteredWeight: inputWeight > 0 ? inputWeight : null,
        unit,
      });

      if (res.error) {
        setErrorMessage(res.error);
        setIsSubmitting(false);
        return;
      }

      // Notificar al temporizador de descanso
      if (onSetCompleted) {
        onSetCompleted(restSeconds);
      }
      setIsSubmitting(false);
    } catch {
      setErrorMessage("No se pudo registrar la serie.");
      setIsSubmitting(false);
    }
  };

  const handleDeleteSet = async (setId: string) => {
    try {
      setDeletingSetId(setId);
      setErrorMessage(null);
      const res = await removeSetAction(sessionId, setId);
      if (res.error) {
        setErrorMessage(res.error);
      }
      setDeletingSetId(null);
    } catch {
      setErrorMessage("Error al eliminar la serie.");
      setDeletingSetId(null);
    }
  };

  return (
    <div
      className={`rounded-3xl border transition-all overflow-hidden ${
        isAllTargetSetsDone
          ? "bg-slate-900/90 border-emerald-500/40 shadow-sm"
          : "bg-slate-900 border-slate-800"
      }`}
    >
      {/* Cabecera del Ejercicio */}
      <div className="p-4 border-b border-slate-800/80 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                isAllTargetSetsDone
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-slate-800 text-slate-300 border border-slate-700"
              }`}
            >
              {isAllTargetSetsDone ? <CheckCircle2 className="w-4 h-4" /> : order}
            </span>

            <div>
              <h3 className="font-bold text-slate-100 text-base leading-snug">
                {name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{muscleGroup}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span
              className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                isAllTargetSetsDone
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              {loggedSets.length} / {targetSets} series
            </span>
          </div>
        </div>

        {/* Metadatos del objetivo */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60 font-medium">
            Meta: {targetSets} series × {targetReps} reps
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700/60 flex items-center gap-1 font-mono text-[11px]">
            <Clock className="w-3 h-3 text-slate-400" />
            {restSeconds}s descanso
          </span>
          <span className="text-slate-500 text-[11px]">• {equipment}</span>
        </div>

        {notes && (
          <p className="text-xs text-emerald-400/90 bg-emerald-950/20 border border-emerald-900/30 p-2 rounded-xl">
            💡 {notes}
          </p>
        )}

        {/* Botón para ver u ocultar técnica */}
        <button
          type="button"
          onClick={() => setShowTechnique(!showTechnique)}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors pt-1"
        >
          <span>{showTechnique ? "Ocultar guía técnica" : "Ver técnica y cuidados"}</span>
          {showTechnique ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* Acordeón de Técnica & Seguridad */}
        {showTechnique && (
          <div className="space-y-2.5 pt-2 text-xs border-t border-slate-800 mt-2">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Instrucciones:
              </span>
              <p className="text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                {instructions}
              </p>
            </div>

            {safetyWarning && (
              <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/30 text-amber-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <p>{safetyWarning}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Series Registradas */}
      {loggedSets.length > 0 && (
        <div className="p-3.5 bg-slate-950/40 border-b border-slate-800 space-y-2">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Series completadas en esta sesión:
          </span>

          <div className="space-y-1.5">
            {loggedSets.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[11px] flex items-center justify-center">
                    {s.setNumber}
                  </span>
                  <span className="font-semibold text-slate-200">
                    {s.repsCompleted} reps
                  </span>
                  <span className="text-slate-400 font-mono">
                    {s.weightKg && s.weightKg > 0
                      ? `@ ${formatWeight(s.weightKg, unit)}`
                      : "(peso corporal)"}
                  </span>
                </div>

                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSet(s.id)}
                    disabled={deletingSetId === s.id}
                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors disabled:opacity-40"
                    title="Eliminar serie"
                  >
                    {deletingSetId === s.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulario para registrar la SIGUIENTE serie (solo si sesión activa) */}
      {!isReadOnly && (
        <div className="p-4 space-y-3.5 bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-emerald-400" />
              <span>Registrar Serie #{nextSetNumber}</span>
            </span>

            {isAllTargetSetsDone && (
              <span className="text-[10px] text-emerald-400 font-medium">
                ¡Meta de series alcanzada! (Puedes añadir más si lo deseas)
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Control de Repeticiones */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2.5 space-y-1.5 text-center">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Repeticiones
              </span>

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setInputReps((prev) => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <input
                  type="number"
                  min="1"
                  max="100"
                  value={inputReps}
                  onChange={(e) => setInputReps(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-14 text-center bg-slate-900 border border-slate-700 rounded-xl py-1 text-base font-black text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />

                <button
                  type="button"
                  onClick={() => setInputReps((prev) => prev + 1)}
                  className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Control de Carga (Peso en kg o lb) */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2.5 space-y-1.5 text-center">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-1">
                <span>Peso ({unit})</span>
              </span>

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setInputWeight((prev) => Math.max(0, Math.round((prev - (unit === "lb" ? 2.5 : 1)) * 10) / 10))}
                  className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="500"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-16 text-center bg-slate-900 border border-slate-700 rounded-xl py-1 text-base font-black text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />

                <button
                  type="button"
                  onClick={() => setInputWeight((prev) => Math.round((prev + (unit === "lb" ? 2.5 : 1)) * 10) / 10)}
                  className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-400 bg-rose-950/30 border border-rose-900/40 p-2 rounded-xl text-center">
              {errorMessage}
            </p>
          )}

          {/* Botón grande para registrar serie */}
          <button
            type="button"
            onClick={handleRecordSet}
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando serie...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Guardar Serie #{nextSetNumber}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
