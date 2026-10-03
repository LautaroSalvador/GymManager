import { getBillingDate, normalizeDate, getDaysDifference, Periodo } from './fecha.utils';

export type ClienteEstado = 'AL_DIA' | 'COBRAR_HOY' | 'PROXIMO_A_VENCER' | 'CON_DEUDA';

export interface DatosClasificacion {
  fechaAlta: Date;
  /** Última reactivación: los meses en que estuvo de baja no se le cobran. */
  fechaReactivacion: Date | null;
  periodosPagados: Periodo[];
  today: Date;
  umbralDias: number;
}

export interface ResultadoClasificacion {
  estado: ClienteEstado;
  /** Períodos vencidos sin pago, del más viejo al más nuevo. */
  mesesAdeudados: Periodo[];
}

/**
 * Clasifica a un cliente según sus pagos:
 * - CON_DEUDA: tiene al menos un mes vencido sin pagar (del mes actual o anteriores).
 * - COBRAR_HOY: hoy vence el mes actual y no lo pagó.
 * - PROXIMO_A_VENCER: el mes actual vence dentro de `umbralDias` y no lo pagó.
 * - AL_DIA: no debe nada vencido.
 *
 * Se revisan todos los meses desde el alta (o desde la última reactivación).
 */
export function clasificarCliente(datos: DatosClasificacion): ResultadoClasificacion {
  const { fechaAlta, fechaReactivacion, periodosPagados, today, umbralDias } = datos;

  const normToday = normalizeDate(today);
  const inicioCobro = getInicioCobro(fechaAlta, fechaReactivacion);

  // Alta (o reactivación) en el futuro: todavía no se le cobra nada.
  if (normToday < inicioCobro) {
    return { estado: 'AL_DIA', mesesAdeudados: [] };
  }

  const pagado = (periodo: Periodo): boolean =>
    periodosPagados.some((p) => p.anio === periodo.anio && p.mes === periodo.mes);

  const mesActual: Periodo = { anio: normToday.getUTCFullYear(), mes: normToday.getUTCMonth() + 1 };

  // Meses anteriores al actual: ya vencieron todos, solo importa si se pagaron.
  const mesesAdeudados = getPeriodosEntre(inicioCobro, mesActual)
    .filter((periodo) => !(periodo.anio === mesActual.anio && periodo.mes === mesActual.mes))
    .filter((periodo) => !pagado(periodo));

  const estadoMesActual = clasificarMesActual(fechaAlta, mesActual, normToday, umbralDias, pagado(mesActual));

  if (estadoMesActual === 'CON_DEUDA') {
    mesesAdeudados.push(mesActual);
  }

  if (mesesAdeudados.length > 0) {
    return { estado: 'CON_DEUDA', mesesAdeudados };
  }

  return { estado: estadoMesActual, mesesAdeudados };
}

function clasificarMesActual(
  fechaAlta: Date,
  mesActual: Periodo,
  today: Date,
  umbralDias: number,
  pagoMesActual: boolean
): ClienteEstado {
  if (pagoMesActual) {
    return 'AL_DIA';
  }

  const billingDate = getBillingDate(fechaAlta, mesActual.anio, mesActual.mes);
  const diasHastaVencimiento = getDaysDifference(billingDate, today);

  if (diasHastaVencimiento === 0) {
    return 'COBRAR_HOY';
  }
  if (diasHastaVencimiento < 0) {
    return 'CON_DEUDA';
  }
  return diasHastaVencimiento <= umbralDias ? 'PROXIMO_A_VENCER' : 'AL_DIA';
}

/** La deuda se cuenta desde el alta o, si se reactivó después, desde la reactivación. */
function getInicioCobro(fechaAlta: Date, fechaReactivacion: Date | null): Date {
  const alta = normalizeDate(fechaAlta);
  if (fechaReactivacion && normalizeDate(fechaReactivacion) > alta) {
    return normalizeDate(fechaReactivacion);
  }
  return alta;
}

/** Todos los períodos desde el mes de `desde` hasta `hasta`, inclusive. */
function getPeriodosEntre(desde: Date, hasta: Periodo): Periodo[] {
  const periodos: Periodo[] = [];
  let anio = desde.getUTCFullYear();
  let mes = desde.getUTCMonth() + 1;

  while (anio < hasta.anio || (anio === hasta.anio && mes <= hasta.mes)) {
    periodos.push({ anio, mes });
    mes++;
    if (mes > 12) {
      mes = 1;
      anio++;
    }
  }

  return periodos;
}
