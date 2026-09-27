import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { Dumbbell, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Iniciar Sesión — FitCouple",
};

export default function LoginPage() {
  return (
    <main className="flex-1 w-full max-w-md mx-auto px-4 py-8 flex flex-col justify-between">
      <div>
        {/* Volver a inicio */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al inicio</span>
        </Link>

        {/* Marca y Bienvenida */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <Dumbbell className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-slate-400">
            Accede a tu espacio de entrenamiento individual
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 shadow-xl">
          <LoginForm />
        </div>
      </div>

      <footer className="mt-8 text-center">
        <p className="text-[11px] text-slate-500">
          FitCouple • Espacio Privado en Pareja
        </p>
      </footer>
    </main>
  );
}
