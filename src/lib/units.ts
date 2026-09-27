// Utilidades de conversión y formateo de unidades (kg <-> lb)
// Regla del sistema: En base de datos SIEMPRE se almacena en kilogramos (weightKg).

const KG_TO_LB = 2.20462262;

export type UnitPreference = "kg" | "lb";

/**
 * Convierte un peso almacenado en kg a la unidad preferida por el usuario.
 */
export function kgToDisplay(kg: number | null | undefined, unit: UnitPreference): number | null {
  if (kg === null || kg === undefined || isNaN(kg)) return null;
  if (unit === "lb") {
    // Redondear a 1 decimal
    return Math.round(kg * KG_TO_LB * 10) / 10;
  }
  return Math.round(kg * 10) / 10;
}

/**
 * Convierte el valor ingresado por el usuario en su unidad preferida a kg para almacenar en la BD.
 */
export function displayToKg(val: number | null | undefined, unit: UnitPreference): number | null {
  if (val === null || val === undefined || isNaN(val)) return null;
  if (unit === "lb") {
    return Math.round((val / KG_TO_LB) * 100) / 100;
  }
  return Math.round(val * 100) / 100;
}

/**
 * Devuelve el texto formateado con la unidad correspondiente (ej. "12.5 kg" o "27.5 lb").
 */
export function formatWeight(kg: number | null | undefined, unit: UnitPreference = "kg"): string {
  if (kg === null || kg === undefined || isNaN(kg) || kg === 0) {
    return "0 " + unit;
  }
  const displayVal = kgToDisplay(kg, unit);
  return `${displayVal} ${unit}`;
}
