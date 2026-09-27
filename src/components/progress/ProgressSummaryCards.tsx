"use client";

import { Calendar, Scale, Activity, ArrowRight } from "lucide-react";
import { ProgressSummary } from "@/lib/measurements";
import { UnitPreference, kgToDisplay } from "@/lib/units";

interface ProgressSummaryCardsProps {
  summary: ProgressSummary;
  unit: UnitPreference;
}

export function ProgressSummaryCards({ summary, unit }: ProgressSummaryCardsProps) {
  if (summary.totalMeasurements === 0) {
    return null;
  }

  // Conversión de pesos a unidad preferida
  const formatWeightVal = (kg: number | null) => {
    if (kg === null) return "--";
    const displayVal = kgToDisplay(kg, unit);
    return `${displayVal} ${unit}`;
  };

  const formatWeightDiff = () => {
    if (summary.weight.first === null || summary.weight.latest === null) return null;
    const firstDisplay = kgToDisplay(summary.weight.first, unit) ?? 0;
    const latestDisplay = kgToDisplay(summary.weight.latest, unit) ?? 0;
    const diff = Math.round((latestDisplay - firstDisplay) * 10) / 10;
    const sign = diff > 0 ? "+" : "";
    return `${sign}${diff} ${unit}`;
  };

  const formatCmDiff = (diff: number | null) => {
    if (diff === null) return null;
    const sign = diff > 0 ? "+" : "";
    return `${sign}${diff} cm`;
  };

  const firstDateStr = summary.firstDate
    ? new Date(summary.firstDate).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      })
    : null;

  const latestDateStr = summary.latestDate
    ? new Date(summary.latestDate).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      })
    : null;

  const weightDiffText = formatWeightDiff();
  const waistDiffText = formatCmDiff(summary.waist.diff);
  const hipDiffText = formatCmDiff(summary.hip.diff);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          Resumen de evolución
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
          {summary.totalMeasurements} mediciones registradas
        </span>
      </div>

      {/* Rango de Fechas */}
      {firstDateStr && latestDateStr && summary.totalMeasurements > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
          <span>Inicio: <strong className="text-slate-200">{firstDateStr}</strong></span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <span>Último: <strong className="text-slate-200">{latestDateStr}</strong></span>
        </div>
      )}

      {/* Métricas Principales */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {/* Peso */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">
            Peso
          </span>
          <span className="text-sm font-black text-slate-100 font-mono block">
            {formatWeightVal(summary.weight.latest)}
          </span>
          {weightDiffText && (
            <span className="text-[11px] font-mono font-bold text-emerald-400 block">
              {weightDiffText}
            </span>
          )}
        </div>

        {/* Cintura */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">
            Cintura
          </span>
          <span className="text-sm font-black text-slate-100 font-mono block">
            {summary.waist.latest ? `${summary.waist.latest} cm` : "--"}
          </span>
          {waistDiffText && (
            <span className="text-[11px] font-mono font-bold text-cyan-400 block">
              {waistDiffText}
            </span>
          )}
        </div>

        {/* Cadera */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">
            Cadera
          </span>
          <span className="text-sm font-black text-slate-100 font-mono block">
            {summary.hip.latest ? `${summary.hip.latest} cm` : "--"}
          </span>
          {hipDiffText && (
            <span className="text-[11px] font-mono font-bold text-purple-400 block">
              {hipDiffText}
            </span>
          )}
        </div>
      </div>

      {/* Otras medidas secundarias si existen */}
      {(summary.chest.latest || summary.arm.latest || summary.thigh.latest) && (
        <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
          {summary.chest.latest && (
            <div className="text-slate-400">
              <span className="text-[10px] block text-slate-500">Pecho</span>
              <strong className="text-slate-200">{summary.chest.latest} cm</strong>
              {formatCmDiff(summary.chest.diff) && (
                <span className="text-[10px] text-slate-400 block font-mono">
                  {formatCmDiff(summary.chest.diff)}
                </span>
              )}
            </div>
          )}
          {summary.arm.latest && (
            <div className="text-slate-400">
              <span className="text-[10px] block text-slate-500">Brazo</span>
              <strong className="text-slate-200">{summary.arm.latest} cm</strong>
              {formatCmDiff(summary.arm.diff) && (
                <span className="text-[10px] text-slate-400 block font-mono">
                  {formatCmDiff(summary.arm.diff)}
                </span>
              )}
            </div>
          )}
          {summary.thigh.latest && (
            <div className="text-slate-400">
              <span className="text-[10px] block text-slate-500">Muslo</span>
              <strong className="text-slate-200">{summary.thigh.latest} cm</strong>
              {formatCmDiff(summary.thigh.diff) && (
                <span className="text-[10px] text-slate-400 block font-mono">
                  {formatCmDiff(summary.thigh.diff)}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
