/**
 * Utility functions for formatting values in the UI.
 */

/**
 * Format a number as Argentine pesos currency.
 * e.g. 15000 → "$15.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string as short readable date in Spanish.
 * e.g. "2026-06-15" → "15 jun. 2026"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Format a date string as month + year.
 * e.g. "2026-06-15" → "junio 2026"
 */
export function formatMonthYear(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Get month name from month number (1-indexed).
 * e.g. 6 → "Junio"
 */
export function getMonthName(month: number): string {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  return meses[month - 1] ?? '';
}

/**
 * Get today's date as ISO "YYYY-MM-DD" string in local time.
 */
export function getTodayISO(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get current month (1-indexed) and year.
 */
export function getCurrentPeriod(): { mes: number; anio: number } {
  const today = new Date();
  return {
    mes: today.getMonth() + 1,
    anio: today.getFullYear(),
  };
}
