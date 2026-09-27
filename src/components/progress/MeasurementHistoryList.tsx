"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Trash2,
  Edit2,
  FileText,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { deleteMeasurementAction } from "@/app/actions/measurements";
import { UnitPreference, formatWeight } from "@/lib/units";
import { MeasurementFormModal, MeasurementData } from "./MeasurementFormModal";

export interface HistoryMeasurementItem {
  id: string;
  measuredAt: string | Date;
  weightKg: number | null;
  waistCm: number | null;
  hipCm: number | null;
  chestCm: number | null;
  armCm: number | null;
  thighCm: number | null;
  notes?: string | null;
}

interface MeasurementHistoryListProps {
  measurements: HistoryMeasurementItem[];
  unit: UnitPreference;
}

export function MeasurementHistoryList({
  measurements,
  unit,
}: MeasurementHistoryListProps) {
  const router = useRouter();
  const [editingItem, setEditingItem] = useState<MeasurementData | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      setErrorMessage(null);
      const res = await deleteMeasurementAction(id);
      if (res.error) {
        setErrorMessage(res.error);
        setDeletingId(null);
        return;
      }
      setConfirmDeleteId(null);
      setDeletingId(null);
      router.refresh();
    } catch {
      setErrorMessage("No se pudo eliminar el registro.");
      setDeletingId(null);
    }
  };

  if (measurements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Historial de Mediciones ({measurements.length})
        </span>
        <span className="text-[11px] font-mono text-slate-500">
          Unidad: {unit.toUpperCase()} / cm
        </span>
      </div>

      {errorMessage && (
        <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/50 p-2.5 rounded-xl text-center">
          {errorMessage}
        </p>
      )}

      <div className="space-y-2.5">
        {measurements.map((m) => {
          const dateStr = new Date(m.measuredAt).toLocaleDateString("es-ES", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={m.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 transition-all shadow-sm"
            >
              {/* Cabecera del ítem */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 capitalize flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {dateStr}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingItem(m)}
                    className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Editar medición"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(m.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Eliminar medición"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Confirmación de borrado */}
              {confirmDeleteId === m.id && (
                <div className="bg-rose-950/30 border border-rose-900/50 p-2.5 rounded-xl space-y-2">
                  <p className="text-xs text-rose-300 text-center font-medium">
                    ¿Eliminar esta medición? Esta acción no se puede deshacer.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      disabled={deletingId === m.id}
                      className="flex-1 py-1.5 px-2 bg-slate-800 text-slate-300 rounded-lg text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(m.id)}
                      disabled={deletingId === m.id}
                      className="flex-1 py-1.5 px-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      {deletingId === m.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <span>Eliminar</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Valores de medidas */}
              <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-xs">
                {m.weightKg !== null && (
                  <div className="bg-slate-950/70 border border-slate-800/80 p-1.5 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Peso</span>
                    <strong className="text-slate-100">{formatWeight(m.weightKg, unit)}</strong>
                  </div>
                )}
                {m.waistCm !== null && (
                  <div className="bg-slate-950/70 border border-slate-800/80 p-1.5 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Cintura</span>
                    <strong className="text-cyan-300">{m.waistCm} cm</strong>
                  </div>
                )}
                {m.hipCm !== null && (
                  <div className="bg-slate-950/70 border border-slate-800/80 p-1.5 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Cadera</span>
                    <strong className="text-purple-300">{m.hipCm} cm</strong>
                  </div>
                )}
                {m.chestCm !== null && (
                  <div className="bg-slate-950/70 border border-slate-800/80 p-1.5 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Pecho</span>
                    <strong className="text-slate-300">{m.chestCm} cm</strong>
                  </div>
                )}
                {m.armCm !== null && (
                  <div className="bg-slate-950/70 border border-slate-800/80 p-1.5 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Brazo</span>
                    <strong className="text-slate-300">{m.armCm} cm</strong>
                  </div>
                )}
                {m.thighCm !== null && (
                  <div className="bg-slate-950/70 border border-slate-800/80 p-1.5 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Muslo</span>
                    <strong className="text-slate-300">{m.thighCm} cm</strong>
                  </div>
                )}
              </div>

              {/* Notas */}
              {m.notes && (
                <div className="flex items-start gap-1.5 text-xs text-slate-400 bg-slate-950/50 p-2 rounded-xl border border-slate-800/60">
                  <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="italic">{m.notes}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de Edición */}
      {editingItem && (
        <MeasurementFormModal
          unit={unit}
          initialData={editingItem}
          isOpen={true}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}
