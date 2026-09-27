"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Scale,
  Plus,
  TrendingUp,
  Activity,
  History,
  Info,
} from "lucide-react";
import { SimpleLineChart, ChartDataPoint } from "./SimpleLineChart";
import { ProgressSummaryCards } from "./ProgressSummaryCards";
import { MeasurementHistoryList, HistoryMeasurementItem } from "./MeasurementHistoryList";
import { MeasurementFormModal } from "./MeasurementFormModal";
import { ProgressSummary } from "@/lib/measurements";
import { UnitPreference, kgToDisplay } from "@/lib/units";

interface ProgressViewProps {
  userSlug: "el" | "ella";
  userName: string;
  unit: UnitPreference;
  measurementsHistory: HistoryMeasurementItem[];
  measurementsChronological: Array<{
    id: string;
    measuredAt: string | Date;
    weightKg: number | null;
    waistCm: number | null;
    hipCm: number | null;
  }>;
  summary: ProgressSummary;
}

export function ProgressView({
  userSlug,
  userName,
  unit,
  measurementsHistory,
  measurementsChronological,
  summary,
}: ProgressViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isHim = userSlug === "el";

  // Preparar puntos de datos para gráficos
  const weightData: ChartDataPoint[] = measurementsChronological
    .filter((m) => m.weightKg !== null && m.weightKg !== undefined)
    .map((m) => ({
      date: new Date(m.measuredAt),
      value: kgToDisplay(m.weightKg, unit) ?? 0,
    }));

  const waistData: ChartDataPoint[] = measurementsChronological
    .filter((m) => m.waistCm !== null && m.waistCm !== undefined)
    .map((m) => ({
      date: new Date(m.measuredAt),
      value: m.waistCm!,
    }));

  const hipData: ChartDataPoint[] = measurementsChronological
    .filter((m) => m.hipCm !== null && m.hipCm !== undefined)
    .map((m) => ({
      date: new Date(m.measuredAt),
      value: m.hipCm!,
    }));

  const hasMeasurements = measurementsHistory.length > 0;

  return (
    <div className="space-y-5">
      {/* Barra Superior */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Mi espacio</span>
        </Link>

        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            isHim
              ? "bg-cyan-950 text-cyan-400 border border-cyan-800/50"
              : "bg-rose-950 text-rose-400 border border-rose-800/50"
          }`}
        >
          {userName} ({unit.toUpperCase()})
        </span>
      </div>

      {/* Cabecera Principal */}
      <header className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" />
            Progreso Corporal
          </span>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {measurementsHistory.length} registros
          </span>
        </div>

        <div>
          <h1 className="text-xl font-black text-slate-100">
            Tu Evolución Física
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Registra tu peso y medidas periódicamente para visualizar tus cambios con datos reales y objetivos.
          </p>
        </div>

        {/* Botón de Añadir Medición */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Registrar nueva medición</span>
        </button>
      </header>

      {/* Contenido: Si no hay mediciones */}
      {!hasMeasurements ? (
        <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center space-y-4 my-4">
          <div className="w-14 h-14 rounded-3xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto border border-slate-700">
            <Scale className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-slate-200 text-base">
              Aún no tienes mediciones registradas
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Toma tu cinta métrica o báscula y guarda tu primer registro. Podrás seguir tu peso ({unit}), cintura y cadera a lo largo del tiempo.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 py-3 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Guardar mi primera medición</span>
            </button>
          </div>
        </section>
      ) : (
        <div className="space-y-5">
          {/* Tarjeta de Resumen Neutro */}
          <ProgressSummaryCards summary={summary} unit={unit} />

          {/* Gráfico de Evolución Cronológica */}
          <SimpleLineChart
            weightData={weightData}
            waistData={waistData}
            hipData={hipData}
            weightUnit={unit}
          />

          {/* Historial Detallado con Edición y Eliminación */}
          <MeasurementHistoryList
            measurements={measurementsHistory}
            unit={unit}
          />
        </div>
      )}

      {/* Modal de Registro */}
      <MeasurementFormModal
        unit={unit}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
