"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, PlayCircle, Loader2 } from "lucide-react";
import { startWorkoutAction } from "@/app/actions/workouts";

interface StartWorkoutButtonProps {
  workoutDayId: string;
  hasActiveSession?: boolean;
  activeSessionId?: string;
  buttonText?: string;
  className?: string;
}

export function StartWorkoutButton({
  workoutDayId,
  hasActiveSession,
  activeSessionId,
  buttonText,
  className = "",
}: StartWorkoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartOrResume = async () => {
    if (hasActiveSession && activeSessionId) {
      router.push(`/entrenamiento/sesion/${activeSessionId}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await startWorkoutAction(workoutDayId);

      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      if (res.sessionId) {
        router.push(`/entrenamiento/sesion/${res.sessionId}`);
      }
    } catch {
      setError("No se pudo iniciar el entrenamiento. Intenta nuevamente.");
      setLoading(false);
    }
  };

  if (hasActiveSession && activeSessionId) {
    return (
      <div className="space-y-2">
        <button
          onClick={handleStartOrResume}
          className={`w-full py-4 px-5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2.5 animate-pulse ${className}`}
        >
          <PlayCircle className="w-5 h-5 fill-slate-950 text-emerald-400 shrink-0" />
          <span className="uppercase tracking-wider">Continuar entrenamiento en curso</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleStartOrResume}
        disabled={loading}
        className={`w-full py-4 px-5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 active:from-emerald-600 active:to-teal-500 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="uppercase tracking-wider">Iniciando sesión...</span>
          </>
        ) : (
          <>
            <Play className="w-5 h-5 fill-slate-950 shrink-0" />
            <span className="uppercase tracking-wider">
              {buttonText || "Empezar Entrenamiento"}
            </span>
          </>
        )}
      </button>

      {error && (
        <p className="text-xs text-rose-400 text-center bg-rose-950/40 border border-rose-900/50 p-2.5 rounded-xl">
          {error}
        </p>
      )}
    </div>
  );
}
