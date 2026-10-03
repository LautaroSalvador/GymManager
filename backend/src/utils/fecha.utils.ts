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

/** Zona horaria del gimnasio: define qué día es "hoy" para vencimientos y reportes. */
export const GYM_TIME_ZONE = 'America/Argentina/Buenos_Aires';

/**
 * Devuelve la fecha calendario actual en la zona horaria del gimnasio,
 * normalizada a medianoche UTC (el mismo formato que usan las fechas @db.Date).
 *
 * Sin esto, a partir de las 21 h de Argentina (00 h UTC) el servidor
 * ya consideraría que es el día siguiente.
 */
export function getToday(now: Date = new Date(), timeZone: string = GYM_TIME_ZONE): Date {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now);

  const getPart = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value);

  return new Date(Date.UTC(getPart('year'), getPart('month') - 1, getPart('day')));
}

export interface Periodo {
  anio: number;
  mes: number; // 1-12
}

/** Convierte los campos de un pago (periodoMes/periodoAnio) a un Periodo. */
export function toPeriodo(pago: { periodoMes: number; periodoAnio: number }): Periodo {
  return { anio: pago.periodoAnio, mes: pago.periodoMes };
}

/**
 * Devuelve los últimos `count` meses (incluido el de `today`), del más viejo
 * al más nuevo. Parte siempre del día 1 para evitar el desborde de fechas:
 * restar un mes al 31/12 daría "31 de noviembre" → 1 de diciembre.
 */
export function getLastMonths(today: Date, count: number): Periodo[] {
  const result: Periodo[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const firstOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - i, 1));
    result.push({ anio: firstOfMonth.getUTCFullYear(), mes: firstOfMonth.getUTCMonth() + 1 });
  }
  return result;
}
