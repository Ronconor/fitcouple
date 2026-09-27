"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Timer,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

interface ExerciseCardProps {
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
}

export function ExerciseCard({
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
}: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden transition-all shadow-sm">
      {/* Cabecera del ejercicio */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
              #{order}
            </span>
            <div>
              <h4 className="font-bold text-slate-100 text-base leading-snug">
                {name}
              </h4>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  {muscleGroup}
                </span>
                <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                  {equipment}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Metas de series, repeticiones y descanso */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                Objetivo
              </span>
              <span className="text-xs font-bold text-slate-200">
                {targetSets} series × {targetReps}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                Descanso
              </span>
              <span className="text-xs font-bold text-slate-200">
                {restSeconds > 0 ? `${restSeconds} seg` : "Continuo"}
              </span>
            </div>
          </div>
        </div>

        {/* Indicación específica del día si existe */}
        {notes && (
          <div className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50 flex items-start gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{notes}</p>
          </div>
        )}
      </div>

      {/* Botón para expandir/colapsar instrucciones */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2.5 px-4 bg-slate-950/80 hover:bg-slate-950 border-t border-slate-800/80 text-xs text-slate-400 hover:text-slate-200 font-semibold flex items-center justify-between transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          {isExpanded ? "Ocultar guía técnica" : "Ver técnica e instrucciones"}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {/* Panel colapsable de instrucciones y advertencias */}
      {isExpanded && (
        <div className="p-4 bg-slate-950/95 border-t border-slate-800 space-y-3.5 text-xs animate-in slide-in-from-top-2 duration-200">
          {/* Instrucciones paso a paso */}
          <div className="space-y-1.5">
            <h5 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Paso a paso
            </h5>
            <div className="text-slate-300 leading-relaxed whitespace-pre-line pl-5">
              {instructions}
            </div>
          </div>

          {/* Errores frecuentes */}
          <div className="space-y-1.5">
            <h5 className="font-semibold text-rose-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Errores frecuentes a evitar
            </h5>
            <p className="text-slate-300 leading-relaxed pl-5">
              {commonMistakes}
            </p>
          </div>

          {/* Alternativa recomendada si aplica */}
          {alternative && (
            <div className="space-y-1.5">
              <h5 className="font-semibold text-cyan-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                Alternativa recomendada
              </h5>
              <p className="text-slate-300 leading-relaxed pl-5">
                {alternative}
              </p>
            </div>
          )}

          {/* Advertencia contextual de salud o articulaciones */}
          {safetyWarning && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
              <p>{safetyWarning}</p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
