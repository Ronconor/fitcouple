"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertOctagon, Loader2, Sparkles, X } from "lucide-react";
import { finishWorkoutAction, cancelWorkoutAction } from "@/app/actions/workouts";

interface SessionFooterProps {
  sessionId: string;
  totalSetsCompleted: number;
}

export function SessionFooter({ sessionId, totalSetsCompleted }: SessionFooterProps) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [isFinishing, setIsFinishing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFinish = async () => {
    try {
      setIsFinishing(true);
      setErrorMessage(null);

      const res = await finishWorkoutAction(sessionId, notes);

      if (res.error) {
        setErrorMessage(res.error);
        setIsFinishing(false);
        return;
      }

      router.push("/historial?celebrate=1");
    } catch {
      setErrorMessage("No se pudo finalizar la sesión.");
      setIsFinishing(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      setErrorMessage(null);

      const res = await cancelWorkoutAction(sessionId);

      if (res.error) {
        setErrorMessage(res.error);
        setIsCancelling(false);
        return;
      }

      router.push("/entrenamiento");
    } catch {
      setErrorMessage("No se pudo cancelar la sesión.");
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-800">
      {/* Notas generales de la sesión */}
      <div className="space-y-1.5">
        <label
          htmlFor="session-notes"
          className="text-xs font-semibold text-slate-300 flex items-center justify-between"
        >
          <span>Notas o sensaciones del entrenamiento (opcional):</span>
          <span className="text-[10px] text-slate-500 font-mono">
            {notes.length}/250
          </span>
        </label>
        <textarea
          id="session-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 250))}
          placeholder="Ej: Buena energía hoy, subí peso en mancuernas, sin molestia en articulaciones..."
          rows={2}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
        />
      </div>

      {errorMessage && (
        <p className="text-xs text-rose-400 bg-rose-950/30 border border-rose-900/40 p-2.5 rounded-xl text-center">
          {errorMessage}
        </p>
      )}

      {/* Botón Principal: Finalizar */}
      {!showConfirmFinish ? (
        <button
          type="button"
          onClick={() => setShowConfirmFinish(true)}
          className="w-full py-4 px-5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-2xl text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5 fill-slate-950" />
          <span>Finalizar Entrenamiento ({totalSetsCompleted} series)</span>
        </button>
      ) : (
        <div className="bg-slate-900 border border-emerald-500/50 p-4 rounded-2xl space-y-3 animate-in fade-in zoom-in-95">
          <div className="text-center space-y-1">
            <h4 className="font-bold text-slate-100 text-sm flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              ¿Listo para guardar tu sesión?
            </h4>
            <p className="text-xs text-slate-400">
              Registraste {totalSetsCompleted} series completadas hoy. Se guardará en tu historial personal.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowConfirmFinish(false)}
              disabled={isFinishing}
              className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
            >
              Seguir entrenando
            </button>

            <button
              type="button"
              onClick={handleFinish}
              disabled={isFinishing}
              className="flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              {isFinishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Sí, guardar y terminar</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Botón secundario: Cancelar / Descartar */}
      {!showConfirmCancel ? (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowConfirmCancel(true)}
            className="text-xs text-slate-500 hover:text-rose-400 transition-colors"
          >
            Descartar o cancelar este entrenamiento
          </button>
        </div>
      ) : (
        <div className="bg-rose-950/20 border border-rose-900/40 p-3.5 rounded-2xl space-y-2.5">
          <p className="text-xs text-rose-300 text-center font-medium">
            ¿Deseas descartar esta sesión? Las series de hoy no se guardarán en tu historial.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowConfirmCancel(false)}
              disabled={isCancelling}
              className="flex-1 py-2 px-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Volver
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isCancelling}
              className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              {isCancelling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <span>Descartar sesión</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
