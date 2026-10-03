import { describe, it, expect } from 'vitest';
import { clasificarCliente, DatosClasificacion } from '../src/utils/clasificacion.utils';
import { Periodo } from '../src/utils/fecha.utils';

const d = (iso: string) => new Date(`${iso}T00:00:00Z`);

/** Períodos pagados de un mismo año. */
const pagados = (anio: number, meses: number[]): Periodo[] => meses.map((mes) => ({ anio, mes }));

function clasificar(overrides: Partial<DatosClasificacion>) {
  return clasificarCliente({
    fechaAlta: d('2026-03-15'),
    fechaReactivacion: null,
    periodosPagados: [],
    today: d('2026-06-10'),
    umbralDias: 3,
    ...overrides,
  });
}

describe('clasificarCliente — mes actual', () => {
  // Alta el 15/03 y pagó marzo, abril y mayo: solo importa junio.
  const alDiaHastaMayo = pagados(2026, [3, 4, 5]);

  it('AL_DIA si pagó el mes actual', () => {
    const r = clasificar({ periodosPagados: pagados(2026, [3, 4, 5, 6]) });
    expect(r).toEqual({ estado: 'AL_DIA', mesesAdeudados: [] });
  });

  it('COBRAR_HOY el día del vencimiento sin pago', () => {
    const r = clasificar({ periodosPagados: alDiaHastaMayo, today: d('2026-06-15') });
    expect(r.estado).toBe('COBRAR_HOY');
  });

  it('PROXIMO_A_VENCER dentro del umbral', () => {
    expect(clasificar({ periodosPagados: alDiaHastaMayo, today: d('2026-06-12') }).estado).toBe('PROXIMO_A_VENCER');
  });

  it('AL_DIA si todavía falta más que el umbral para vencer', () => {
    expect(clasificar({ periodosPagados: alDiaHastaMayo, today: d('2026-06-11') }).estado).toBe('AL_DIA');
  });

  it('CON_DEUDA al día siguiente del vencimiento, con el mes actual adeudado', () => {
    const r = clasificar({ periodosPagados: alDiaHastaMayo, today: d('2026-06-16') });
    expect(r).toEqual({ estado: 'CON_DEUDA', mesesAdeudados: [{ anio: 2026, mes: 6 }] });
  });

  it('alta el 31: en un mes de 30 días vence el 30', () => {
    const r = clasificar({
      fechaAlta: d('2026-01-31'),
      periodosPagados: pagados(2026, [1, 2, 3]),
      today: d('2026-04-30'),
    });
    expect(r.estado).toBe('COBRAR_HOY');
  });
});

describe('clasificarCliente — deuda de meses anteriores', () => {
  it('detecta un mes anterior impago aunque el actual todavía no venza (caso del 5 de junio)', () => {
    // Vence el 20; no pagó mayo; hoy es 5 de junio.
    const r = clasificar({
      fechaAlta: d('2026-03-20'),
      periodosPagados: pagados(2026, [3, 4]),
      today: d('2026-06-05'),
    });
    expect(r).toEqual({ estado: 'CON_DEUDA', mesesAdeudados: [{ anio: 2026, mes: 5 }] });
  });

  it('la deuda anterior tiene prioridad aunque haya pagado el mes actual', () => {
    const r = clasificar({ periodosPagados: pagados(2026, [3, 5, 6]) });
    expect(r).toEqual({ estado: 'CON_DEUDA', mesesAdeudados: [{ anio: 2026, mes: 4 }] });
  });

  it('lista todos los meses adeudados, del más viejo al más nuevo, cruzando de año', () => {
    const r = clasificarCliente({
      fechaAlta: d('2025-11-05'),
      fechaReactivacion: null,
      periodosPagados: [{ anio: 2025, mes: 11 }],
      today: d('2026-02-10'),
      umbralDias: 3,
    });
    expect(r.mesesAdeudados).toEqual([
      { anio: 2025, mes: 12 },
      { anio: 2026, mes: 1 },
      { anio: 2026, mes: 2 },
    ]);
  });

  it('el mes de alta se cobra (vence el mismo día del alta)', () => {
    const r = clasificar({ fechaAlta: d('2026-06-01'), today: d('2026-06-10') });
    expect(r).toEqual({ estado: 'CON_DEUDA', mesesAdeudados: [{ anio: 2026, mes: 6 }] });
  });

  it('ignora pagos adelantados de meses futuros', () => {
    const r = clasificar({ periodosPagados: pagados(2026, [3, 4, 5, 6, 7, 8]) });
    expect(r.estado).toBe('AL_DIA');
  });
});

describe('clasificarCliente — reactivación y altas futuras', () => {
  it('no cobra los meses en que el cliente estuvo dado de baja', () => {
    // Alta en 2025, sin pagos; se reactivó el 1 de junio y vence el 15.
    const r = clasificar({
      fechaAlta: d('2025-01-15'),
      fechaReactivacion: d('2026-06-01'),
      today: d('2026-06-10'),
    });
    expect(r).toEqual({ estado: 'AL_DIA', mesesAdeudados: [] });
  });

  it('después de reactivarse, cuenta la deuda desde el mes de reactivación', () => {
    const r = clasificar({
      fechaAlta: d('2025-01-15'),
      fechaReactivacion: d('2026-04-01'),
      periodosPagados: pagados(2026, [4]),
      today: d('2026-06-10'),
    });
    expect(r).toEqual({ estado: 'CON_DEUDA', mesesAdeudados: [{ anio: 2026, mes: 5 }] });
  });

  it('una reactivación anterior al alta no cambia nada', () => {
    const r = clasificar({
      fechaAlta: d('2026-03-15'),
      fechaReactivacion: d('2026-01-01'),
      periodosPagados: pagados(2026, [3, 4]),
    });
    expect(r.mesesAdeudados).toEqual([{ anio: 2026, mes: 5 }]);
  });

  it('alta en el futuro: AL_DIA y sin deuda', () => {
    const r = clasificar({ fechaAlta: d('2026-07-01'), today: d('2026-06-10') });
    expect(r).toEqual({ estado: 'AL_DIA', mesesAdeudados: [] });
  });
});
