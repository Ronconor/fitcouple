"use client";

import { useActionState, useState } from "react";
import { loginAction, type ActionState } from "@/app/actions/auth";
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    loginAction,
    null
  );
  const [selectedSlug, setSelectedSlug] = useState<"el" | "ella">("el");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      {/* Selector de Perfil a Iniciar */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Selecciona tu perfil
        </label>
        <div className="grid grid-cols-2 gap-3">
          {/* Botón selector: Él */}
          <button
            type="button"
            onClick={() => setSelectedSlug("el")}
            className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              selectedSlug === "el"
                ? "bg-cyan-950/60 border-cyan-500 text-cyan-200 ring-2 ring-cyan-500/20 shadow-md"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                selectedSlug === "el"
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              ÉL
            </div>
            <span className="text-sm font-semibold">Perfil de Él</span>
          </button>

          {/* Botón selector: Ella */}
          <button
            type="button"
            onClick={() => setSelectedSlug("ella")}
            className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
              selectedSlug === "ella"
                ? "bg-rose-950/60 border-rose-500 text-rose-200 ring-2 ring-rose-500/20 shadow-md"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                selectedSlug === "ella"
                  ? "bg-rose-500 text-slate-950"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              ELLA
            </div>
            <span className="text-sm font-semibold">Perfil de Ella</span>
          </button>
        </div>
      </div>

      {/* Input oculto con el slug elegido */}
      <input type="hidden" name="slug" value={selectedSlug} />

      {/* Campo de Contraseña */}
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="text-xs font-semibold text-slate-300 uppercase tracking-wider block"
        >
          Contraseña privada
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="Ingresa tu contraseña"
            className="w-full pl-10 pr-11 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mensaje de Error */}
      {state?.error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <p>{state.error}</p>
        </div>
      )}

      {/* Botón de Envío */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
      >
        <ShieldCheck className="w-4 h-4" />
        <span>{isPending ? "Validando acceso..." : "Entrar a mi espacio"}</span>
      </button>

      <p className="text-[11px] text-center text-slate-500 pt-1">
        Acceso restringido exclusivamente a los dos perfiles de FitCouple.
      </p>
    </form>
  );
}
