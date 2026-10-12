/**
 * AQUI LAS FECHAS SON TEXTO `YYYY-MM-DD` EN HORA LOCAL.
 * `new Date('2025-01-01')` SE LEE COMO UTC Y EN ECUADOR (UTC-5) MUESTRA EL DIA ANTERIOR,
 * POR ESO ARMAMOS LAS FECHAS PIEZA POR PIEZA.
 * DE PASO, COMO TEXTO SE COMPARAN SIN PROBLEMA: '2025-01-01' < '2025-02-01'.
 */

const pad = (n: number): string => String(n).padStart(2, '0');

export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

/** SUMA ANIOS. SI CAE EN 29 DE FEBRERO Y EL ANIO NO ES BISIESTO, SE QUEDA EN EL 28. */
export function addYearsIso(iso: string, years: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const targetYear = year + years;
  const lastDayOfMonth = new Date(targetYear, month, 0).getDate();
  return toIsoDate(new Date(targetYear, month - 1, Math.min(day, lastDayOfMonth)));
}
