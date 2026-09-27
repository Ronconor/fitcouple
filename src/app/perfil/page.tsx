import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "./ProfileForm";
import { ArrowLeft, User, Shield } from "lucide-react";

export const metadata = {
  title: "Mi Perfil — FitCouple",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isHim = user.slug === "el";
  const displayName = user.profile?.displayName || user.name;
  const unit = user.profile?.unitPreference || "kg";
  const generalGoal = user.profile?.generalGoal || "";

  return (
    <main className="flex-1 w-full max-w-md mx-auto px-4 py-8 flex flex-col justify-between">
      <div>
        {/* Volver al Dashboard */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a mi espacio</span>
        </Link>

        {/* Encabezado del Perfil */}
        <div className="flex items-center gap-3.5 mb-6">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-inner ${
              isHim
                ? "bg-cyan-950 text-cyan-400 border border-cyan-800/50"
                : "bg-rose-950 text-rose-400 border border-rose-800/50"
            }`}
          >
            {isHim ? "ÉL" : "ELLA"}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">
              Ajustes de Perfil
            </h1>
            <p className="text-xs text-slate-400">
              Identificador permanente: <span className="font-mono text-slate-300 font-semibold">{user.slug}</span>
            </p>
          </div>
        </div>

        {/* Contenedor del Formulario */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 shadow-xl">
          <ProfileForm
            initialDisplayName={displayName}
            initialUnit={unit}
            initialGoal={generalGoal}
          />
        </div>

        {/* Garantía de Aislamiento */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-2.5 text-slate-400 text-xs">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>
            Cualquier modificación se aplica exclusivamente a tu identificador (<span className="font-mono text-slate-300">{user.slug}</span>). Los datos del otro perfil permanecen intactos.
          </p>
        </div>
      </div>

      <footer className="mt-8 text-center">
        <p className="text-[11px] text-slate-500">
          FitCouple • Privacidad y Aislamiento Local
        </p>
      </footer>
    </main>
  );
}
