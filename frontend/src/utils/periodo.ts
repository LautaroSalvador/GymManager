import { getCurrentPeriod } from './format';
import type { Periodo } from '../types/cliente.types';

const toIndex = (p: Periodo) => p.anio * 12 + (p.mes - 1);

/**
 * Períodos para elegir en un selector: desde `mesesAtras` meses antes del actual
 * hasta `mesesAdelante` meses después, más los períodos de `incluir` que queden
 * fuera de ese rango. Ordenados del más viejo al más nuevo.
 */
export function getPeriodOptions(mesesAtras: number, mesesAdelante: number, incluir: Periodo[] = []): Periodo[] {
  const { mes, anio } = getCurrentPeriod();
  const options: Periodo[] = [];

  for (let offset = -mesesAtras; offset <= mesesAdelante; offset++) {
    const d = new Date(anio, mes - 1 + offset, 1);
    options.push({ mes: d.getMonth() + 1, anio: d.getFullYear() });
  }

  for (const periodo of incluir) {
    if (!options.some((o) => o.mes === periodo.mes && o.anio === periodo.anio)) {
      options.push(periodo);
    }
  }

  return options.sort((a, b) => toIndex(a) - toIndex(b));
}
