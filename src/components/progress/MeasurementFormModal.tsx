"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Scale,
  Calendar,
  X,
  Loader2,
  CheckCircle2,
  Edit2,
  AlertCircle,
} from "lucide-react";
import { saveMeasurementAction } from "@/app/actions/measurements";
import { UnitPreference, kgToDisplay } from "@/lib/units";

export interface MeasurementData {
  id?: string;
  measuredAt: string | Date;
  weightKg?: number | null;
  waistCm?: number | null;
  hipCm?: number | null;
  chestCm?: number | null;
  armCm?: number | null;
  thighCm?: number | null;
  notes?: string | null;
}

interface MeasurementFormModalProps {
  unit: UnitPreference;
  initialData?: MeasurementData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MeasurementFormModal({
  unit,
  initialData,
  isOpen,
  onClose,
}: MeasurementFormModalProps) {
  const router = useRouter();

  // Fecha en formato YYYY-MM-DD
  const formatInitialDate = (dateVal?: string | Date) => {
    if (!dateVal) {
      const today = new Date();
      return today.toISOString().split("T")[0];
    }
    const d = new Date(dateVal);
    return !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
  };

  const initialWeightDisplay =
    initialData?.weightKg !== null && initialData?.weightKg !== undefined
      ? kgToDisplay(initialData.weightKg, unit) ?? ""
      : "";

  const [date, setDate] = useState<string>(formatInitialDate(initialData?.measuredAt));
  const [weight, setWeight] = useState<string>(initialWeightDisplay ? String(initialWeightDisplay) : "");
  const [waist, setWaist] = useState<string>(initialData?.waistCm ? String(initialData.waistCm) : "");
  const [hip, setHip] = useState<string>(initialData?.hipCm ? String(initialData.hipCm) : "");
  const [chest, setChest] = useState<string>(initialData?.chestCm ? String(initialData.chestCm) : "");
  const [arm, setArm] = useState<string>(initialData?.armCm ? String(initialData.armCm) : "");
  const [thigh, setThigh] = useState<string>(initialData?.thighCm ? String(initialData.thighCm) : "");
  const [notes, setNotes] = useState<string>(initialData?.notes || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que al menos un campo numérico esté lleno
    const parsedWeight = parseFloat(weight);
    const parsedWaist = parseFloat(waist);
    const parsedHip = parseFloat(hip);
    const parsedChest = parseFloat(chest);
    const parsedArm = parseFloat(arm);
    const parsedThigh = parseFloat(thigh);

    const hasAnyMeasurement =
      (!isNaN(parsedWeight) && parsedWeight > 0) ||
      (!isNaN(parsedWaist) && parsedWaist > 0) ||
      (!isNaN(parsedHip) && parsedHip > 0) ||
      (!isNaN(parsedChest) && parsedChest > 0) ||
      (!isNaN(parsedArm) && parsedArm > 0) ||
      (!isNaN(parsedThigh) && parsedThigh > 0);

    if (!hasAnyMeasurement) {
      setErrorMessage("Por favor ingresa al menos una medida numérica (peso, cintura, etc.).");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const res = await saveMeasurementAction({
        id: initialData?.id,
        measuredAt: date,
        enteredWeight: !isNaN(parsedWeight) && parsedWeight > 0 ? parsedWeight : null,
        unit,
        waistCm: !isNaN(parsedWaist) && parsedWaist > 0 ? parsedWaist : null,
        hipCm: !isNaN(parsedHip) && parsedHip > 0 ? parsedHip : null,
        chestCm: !isNaN(parsedChest) && parsedChest > 0 ? parsedChest : null,
        armCm: !isNaN(parsedArm) && parsedArm > 0 ? parsedArm : null,
        thighCm: !isNaN(parsedThigh) && parsedThigh > 0 ? parsedThigh : null,
        notes: notes.trim() || null,
      });

      if (res.error) {
        setErrorMessage(res.error);
        setIsSubmitting(false);
        return;
      }

      onClose();
      router.refresh();
    } catch {
      setErrorMessage("Ocurrió un error al guardar los datos.");
      setIsSubmitting(false);
    }
  };

  const isEditing = Boolean(initialData?.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-6 sm:fade-in duration-200">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">
              {isEditing ? "Editar Medición" : "Nueva Medición Corporal"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fecha */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fecha de medición:</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-2.5 px-3.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Medidas Principales */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Medidas corporales (completa al menos una):
            </span>

            <div className="grid grid-cols-2 gap-3">
              {/* Peso */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2.5 space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 block">
                  Peso ({unit.toUpperCase()})
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="300"
                  placeholder="ej. 82.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-1.5 px-2.5 text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Cintura */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2.5 space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 block">
                  Cintura (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="30"
                  max="200"
                  placeholder="ej. 84.0"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-1.5 px-2.5 text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Cadera */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2.5 space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 block">
                  Cadera (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="30"
                  max="200"
                  placeholder="ej. 98.0"
                  value={hip}
                  onChange={(e) => setHip(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-1.5 px-2.5 text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Pecho */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2.5 space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 block">
                  Pecho (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="30"
                  max="200"
                  placeholder="ej. 102.0"
                  value={chest}
                  onChange={(e) => setChest(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-1.5 px-2.5 text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Brazo */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2.5 space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 block">
                  Brazo (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="15"
                  max="80"
                  placeholder="ej. 34.5"
                  value={arm}
                  onChange={(e) => setArm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-1.5 px-2.5 text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Muslo */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2.5 space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 block">
                  Muslo (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="20"
                  max="100"
                  placeholder="ej. 56.0"
                  value={thigh}
                  onChange={(e) => setThigh(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-1.5 px-2.5 text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Notas u observaciones (opcional):
            </label>
            <textarea
              rows={2}
              maxLength={200}
              placeholder="Ej: Medición matutina en ayunas..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/50 p-2.5 rounded-xl text-center flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </p>
          )}

          {/* Botones */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-2xl text-xs transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? "Actualizar" : "Guardar Registro"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
