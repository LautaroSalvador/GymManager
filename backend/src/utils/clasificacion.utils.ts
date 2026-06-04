import { getBillingDate, normalizeDate, getDaysDifference } from './fecha.utils';

export type ClienteEstado = 'AL_DIA' | 'COBRAR_HOY' | 'PROXIMO_A_VENCER' | 'CON_DEUDA';

export function clasificarCliente(
  fechaAlta: Date,
  hasPaidCurrentMonth: boolean,
  today: Date,
  umbralDias: number
): ClienteEstado {
  if (hasPaidCurrentMonth) {
    return 'AL_DIA';
  }

  const normToday = normalizeDate(today);
  const normAlta = normalizeDate(fechaAlta);

  // If the client's registration date is in the future relative to "today"
  if (normToday < normAlta) {
    return 'AL_DIA';
  }

  const currentYear = normToday.getUTCFullYear();
  const currentMonth = normToday.getUTCMonth() + 1; // 1-indexed

  const billingDate = getBillingDate(fechaAlta, currentYear, currentMonth);
  const diffDays = getDaysDifference(billingDate, normToday); // billingDate - today

  if (diffDays === 0) {
    return 'COBRAR_HOY';
  } else if (diffDays > 0) {
    if (diffDays <= umbralDias) {
      return 'PROXIMO_A_VENCER';
    }
    return 'AL_DIA';
  } else {
    return 'CON_DEUDA';
  }
}
