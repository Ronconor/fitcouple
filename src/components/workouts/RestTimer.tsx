"use client";

import { useState, useEffect, useRef } from "react";
import { Timer, Play, Pause, RotateCcw, Plus, Check } from "lucide-react";

interface RestTimerProps {
  initialSeconds?: number;
  autoStartKey?: string | number | null;
}

export function RestTimer({ initialSeconds = 90, autoStartKey }: RestTimerProps) {
  const [targetSeconds, setTargetSeconds] = useState(initialSeconds);
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-iniciar cuando cambia el autoStartKey (ej. se registra una serie)
  useEffect(() => {
    if (autoStartKey !== undefined && autoStartKey !== null) {
      setTimeLeft(targetSeconds);
      setIsRunning(true);
      setIsCompleted(false);
    }
  }, [autoStartKey, targetSeconds]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const toggleTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(targetSeconds);
      setIsCompleted(false);
      setIsRunning(true);
    } else {
      setIsRunning((prev) => !prev);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setTimeLeft(targetSeconds);
  };

  const addTime = (seconds: number) => {
    setTimeLeft((prev) => prev + seconds);
    if (!isRunning) setIsRunning(true);
  };

  const setPreset = (seconds: number) => {
    setTargetSeconds(seconds);
    setTimeLeft(seconds);
    setIsCompleted(false);
    setIsRunning(true);
  };

  const formatMinutesSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progressPercent = Math.min(100, Math.max(0, ((targetSeconds - timeLeft) / targetSeconds) * 100));

  return (
    <div
      className={`rounded-2xl border transition-all p-3.5 ${
        isCompleted
          ? "bg-emerald-950/60 border-emerald-500/80 shadow-lg shadow-emerald-500/20"
          : isRunning
          ? "bg-slate-900 border-emerald-500/40 shadow-md"
          : "bg-slate-900/80 border-slate-800"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isCompleted
                ? "bg-emerald-500 text-slate-950 animate-bounce"
                : isRunning
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {isCompleted ? <Check className="w-5 h-5 font-bold" /> : <Timer className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                {isCompleted ? "¡Tiempo cumplido! Siguiente serie" : "Descanso entre series"}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono text-2xl font-black ${
                  isCompleted
                    ? "text-emerald-300"
                    : isRunning
                    ? "text-slate-100"
                    : "text-slate-300"
                }`}
              >
                {formatMinutesSeconds(timeLeft)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                / {formatMinutesSeconds(targetSeconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de Control */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleTimer}
            className={`p-2.5 rounded-xl font-bold transition-all text-xs flex items-center justify-center ${
              isRunning
                ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40"
                : "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-sm"
            }`}
            title={isRunning ? "Pausar" : "Iniciar"}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
          </button>

          <button
            type="button"
            onClick={resetTimer}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            title="Reiniciar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => addTime(30)}
            className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-colors flex items-center gap-0.5"
            title="+30 segundos"
          >
            <Plus className="w-3 h-3" />
            <span>30s</span>
          </button>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isCompleted ? "bg-emerald-400" : "bg-emerald-500"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Presets Rápidos */}
      <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-800/60 text-[11px]">
        <span className="text-slate-500 text-[10px] mr-1">Rápido:</span>
        {[45, 60, 90, 120].map((sec) => (
          <button
            key={sec}
            type="button"
            onClick={() => setPreset(sec)}
            className={`px-2 py-0.5 rounded-lg font-mono text-[10px] transition-colors ${
              targetSeconds === sec
                ? "bg-slate-700 text-emerald-300 font-bold border border-emerald-500/30"
                : "bg-slate-800/60 text-slate-400 hover:bg-slate-800"
            }`}
          >
            {sec}s
          </button>
        ))}
      </div>
    </div>
  );
}
