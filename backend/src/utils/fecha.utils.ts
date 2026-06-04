/**
 * Returns the billing Date for a specific client's fechaAlta in a target year and month (1-indexed).
 * Properly handles month end boundaries (e.g. Feb 28, Apr 30, etc.).
 */
export function getBillingDate(fechaAlta: Date, year: number, month: number): Date {
  const altaDate = new Date(fechaAlta);
  const altaDay = altaDate.getUTCDate();

  // Vencimiento = mismo día del mes en que se dio de alta.
  // Si ese día no existe en el mes destino (ej: día 31 en febrero), se usa el último día.
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const targetDay = Math.min(altaDay, lastDay);

  return new Date(Date.UTC(year, month - 1, targetDay));
}

/**
 * Normalizes a date to midnight UTC for stable comparison.
 */
export function normalizeDate(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Returns the difference in days between two dates, ignoring time.
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  const d1 = normalizeDate(date1).getTime();
  const d2 = normalizeDate(date2).getTime();
  const diffTime = d1 - d2;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
