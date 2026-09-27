"use client";

import { useActionState } from "react";
import { updateProfileAction, type ActionState } from "@/app/actions/auth";
import { User, Scale, Target, CheckCircle2, AlertCircle, Save } from "lucide-react";

interface ProfileFormProps {
  initialDisplayName: string;
  initialUnit: string;
  initialGoal: string;
}

export function ProfileForm({
  initialDisplayName,
  initialUnit,
  initialGoal,
}: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    updateProfileAction,
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      {/* Campo: Nombre visible */}
      <div className="space-y-1.5">
        <label
          htmlFor="displayName"
          className="text-xs font-semibold text-slate-300 uppercase tracking-wider block"
        >
          Nombre visible
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <User className="w-4 h-4" />
          </div>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            defaultValue={initialDisplayName}
            placeholder="Tu nombre"
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
        </div>
        <p className="text-[11px] text-slate-500">
          Este nombre se mostrará en tu saludo y registros.
        </p>
      </div>

      {/* Campo: Preferencia de Unidades */}
      <div className="space-y-1.5">
        <label
          htmlFor="unitPreference"
          className="text-xs font-semibold text-slate-300 uppercase tracking-wider block"
        >
          Unidad de peso preferida
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-all has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-950/20">
            <input
              type="radio"
              name="unitPreference"
              value="kg"
              defaultChecked={initialUnit === "kg"}
              className="text-emerald-500 focus:ring-emerald-500"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-200 block">Kilogramos (kg)</span>
              <span className="text-slate-500 text-[11px]">Recomendado para el kit</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-all has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-950/20">
            <input
              type="radio"
              name="unitPreference"
              value="lb"
              defaultChecked={initialUnit === "lb"}
              className="text-emerald-500 focus:ring-emerald-500"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-200 block">Libras (lb)</span>
              <span className="text-slate-500 text-[11px]">Sistema imperial</span>
            </div>
          </label>
        </div>
      </div>

      {/* Campo: Objetivo general */}
      <div className="space-y-1.5">
        <label
          htmlFor="generalGoal"
          className="text-xs font-semibold text-slate-300 uppercase tracking-wider block"
        >
          Objetivo general de entrenamiento
        </label>
        <div className="relative">
          <div className="absolute top-3 left-3.5 pointer-events-none text-slate-500">
            <Target className="w-4 h-4" />
          </div>
          <textarea
            id="generalGoal"
            name="generalGoal"
            rows={2}
            defaultValue={initialGoal}
            placeholder="Ej: Tonificar, fuerza, recomposición..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
        </div>
        <p className="text-[11px] text-slate-500">
          Nota orientativa personal. No incluye datos médicos.
        </p>
      </div>

      {/* Feedback de estado */}
      {state?.error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <p>{state.error}</p>
        </div>
      )}

      {state?.success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-emerald-300 text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
          <p>Perfil actualizado correctamente.</p>
        </div>
      )}

      {/* Botón de Guardar */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        <span>{isPending ? "Guardando cambios..." : "Guardar cambios"}</span>
      </button>
    </form>
  );
}
