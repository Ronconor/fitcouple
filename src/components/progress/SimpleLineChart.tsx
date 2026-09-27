"use client";

import { useState } from "react";
import { TrendingUp, Calendar, Info } from "lucide-react";

export interface ChartDataPoint {
  date: Date;
  value: number;
}

interface SimpleLineChartProps {
  weightData: ChartDataPoint[];
  waistData: ChartDataPoint[];
  hipData: ChartDataPoint[];
  weightUnit: "kg" | "lb";
}

type MetricTab = "weight" | "waist" | "hip";

export function SimpleLineChart({
  weightData,
  waistData,
  hipData,
  weightUnit,
}: SimpleLineChartProps) {
  const [activeTab, setActiveTab] = useState<MetricTab>("weight");

  const currentData =
    activeTab === "weight"
      ? weightData
      : activeTab === "waist"
      ? waistData
      : hipData;

  const currentUnit = activeTab === "weight" ? weightUnit : "cm";
  const currentTitle =
    activeTab === "weight"
      ? `Evolución del Peso (${weightUnit.toUpperCase()})`
      : activeTab === "waist"
      ? "Evolución de Cintura (cm)"
      : "Evolución de Cadera (cm)";

  const strokeColor =
    activeTab === "weight" ? "#10b981" : activeTab === "waist" ? "#06b6d4" : "#a855f7";
  const fillColor =
    activeTab === "weight" ? "rgba(16, 185, 129, 0.15)" : activeTab === "waist" ? "rgba(6, 182, 212, 0.15)" : "rgba(168, 85, 247, 0.15)";

  // Configuración SVG
  const width = 340;
  const height = 170;
  const paddingX = 35;
  const paddingTop = 25;
  const paddingBottom = 30;

  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingTop - paddingBottom;

  const hasData = currentData.length > 0;
  const isSinglePoint = currentData.length === 1;

  // Calcular mínimos y máximos para escala real
  const values = currentData.map((d) => d.value);
  const minVal = hasData ? Math.min(...values) : 0;
  const maxVal = hasData ? Math.max(...values) : 100;
  const range = maxVal - minVal;
  // Margen vertical para no pegar al borde
  const yBuffer = range === 0 ? 5 : range * 0.15;
  const effectiveMin = Math.max(0, minVal - yBuffer);
  const effectiveMax = maxVal + yBuffer;
  const effectiveRange = effectiveMax - effectiveMin || 1;

  // Coordenadas de los puntos
  const points = currentData.map((d, index) => {
    const x =
      isSinglePoint
        ? width / 2
        : paddingX + (index / (currentData.length - 1)) * innerWidth;
    const y =
      height -
      paddingBottom -
      ((d.value - effectiveMin) / effectiveRange) * innerHeight;
    return { x, y, value: d.value, date: d.date };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Path de área para sombra suave debajo de la línea
  const areaPath =
    points.length > 1
      ? `M ${points[0].x},${height - paddingBottom} ` +
        points.map((p) => `L ${p.x},${p.y}`).join(" ") +
        ` L ${points[points.length - 1].x},${height - paddingBottom} Z`
      : "";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4.5 space-y-3.5 shadow-sm">
      {/* Selector de Pestañas de Métrica */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          Gráfico de evolución
        </span>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("weight")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === "weight"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Peso
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("waist")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === "waist"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Cintura
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("hip")}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeTab === "hip"
                ? "bg-purple-500 text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Cadera
          </button>
        </div>
      </div>

      <div className="flex items-baseline justify-between pt-0.5 px-0.5">
        <h4 className="text-sm font-bold text-slate-100">{currentTitle}</h4>
        {hasData && (
          <span className="text-xs font-mono text-slate-400">
            Último: <strong className="text-slate-100">{values[values.length - 1]} {currentUnit}</strong>
          </span>
        )}
      </div>

      {/* Área del Gráfico SVG */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-2 relative overflow-hidden flex items-center justify-center min-h-[175px]">
        {!hasData ? (
          <div className="text-center py-6 px-4 space-y-1.5">
            <Info className="w-6 h-6 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400">
              Aún no hay mediciones de {activeTab === "weight" ? "peso" : activeTab === "waist" ? "cintura" : "cadera"}.
            </p>
            <p className="text-[11px] text-slate-500">
              Registra tu primera medición arriba para comenzar a graficar tu evolución.
            </p>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible select-none"
          >
            {/* Líneas guía horizontales discretas */}
            <line
              x1={paddingX}
              y1={paddingTop}
              x2={width - paddingX}
              y2={paddingTop}
              stroke="#334155"
              strokeDasharray="2 3"
              strokeWidth="0.8"
            />
            <line
              x1={paddingX}
              y1={height - paddingBottom}
              x2={width - paddingX}
              y2={height - paddingBottom}
              stroke="#334155"
              strokeWidth="0.8"
            />

            {/* Área sombreada */}
            {areaPath && <path d={areaPath} fill={fillColor} />}

            {/* Línea conectora entre puntos reales (sin curvas artificiales) */}
            {points.length > 1 && (
              <polyline
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
              />
            )}

            {/* Puntos y etiquetas de valor */}
            {points.map((p, idx) => {
              const dateStr = new Date(p.date).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
              });

              return (
                <g key={idx}>
                  {/* Punto central */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSinglePoint ? "5.5" : "4"}
                    fill="#0f172a"
                    stroke={strokeColor}
                    strokeWidth="2.5"
                  />

                  {/* Valor sobre el punto */}
                  <text
                    x={p.x}
                    y={p.y - 8}
                    textAnchor="middle"
                    fill="#f1f5f9"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {p.value}
                  </text>

                  {/* Fecha debajo del eje */}
                  <text
                    x={p.x}
                    y={height - 10}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="sans-serif"
                  >
                    {dateStr}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      <p className="text-[10px] text-slate-500 text-center">
        * Puntos con fechas reales registradas. Sin interpolaciones ni predicciones automáticas.
      </p>
    </div>
  );
}
