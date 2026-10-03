import { describe, it, expect } from 'vitest';
import { getBillingDate, getDaysDifference, getLastMonths, getToday } from '../src/utils/fecha.utils';

/** Fecha calendario a medianoche UTC, igual que las columnas @db.Date. */
const d = (iso: string) => new Date(`${iso}T00:00:00Z`);
const isoDate = (date: Date) => date.toISOString().slice(0, 10);

describe('getBillingDate', () => {
  it('vence el mismo día del mes en que se dio de alta', () => {
    expect(isoDate(getBillingDate(d('2026-01-15'), 2026, 6))).toBe('2026-06-15');
  });

  it('usa el último día del mes si el día de alta no existe (31 → 30 de abril)', () => {
    expect(isoDate(getBillingDate(d('2026-01-31'), 2026, 4))).toBe('2026-04-30');
  });

  it('usa el 28 de febrero en años no bisiestos y el 29 en bisiestos', () => {
    expect(isoDate(getBillingDate(d('2026-01-30'), 2026, 2))).toBe('2026-02-28');
    expect(isoDate(getBillingDate(d('2026-01-30'), 2028, 2))).toBe('2028-02-29');
  });

  it('vuelve al día original en meses que sí lo tienen', () => {
    expect(isoDate(getBillingDate(d('2026-01-31'), 2026, 5))).toBe('2026-05-31');
  });
});

describe('getDaysDifference', () => {
  it('ignora la hora y devuelve días enteros (positivo si la primera fecha es posterior)', () => {
    expect(getDaysDifference(d('2026-06-15'), new Date('2026-06-12T23:59:00Z'))).toBe(3);
    expect(getDaysDifference(d('2026-06-10'), d('2026-06-15'))).toBe(-5);
  });
});

describe('getToday', () => {
  it('a las 21:30 de Argentina sigue siendo el mismo día (aunque en UTC ya sea el siguiente)', () => {
    // 2027-01-01 00:30 UTC = 2026-12-31 21:30 en Buenos Aires (UTC-3)
    expect(isoDate(getToday(new Date('2027-01-01T00:30:00Z')))).toBe('2026-12-31');
  });

  it('a la medianoche de Argentina cambia de día', () => {
    // 2026-06-16 03:00 UTC = 2026-06-16 00:00 en Buenos Aires
    expect(isoDate(getToday(new Date('2026-06-16T03:00:00Z')))).toBe('2026-06-16');
  });

  it('devuelve la fecha a medianoche UTC', () => {
    expect(getToday(new Date('2026-06-15T15:45:12Z')).toISOString()).toBe('2026-06-15T00:00:00.000Z');
  });
});

describe('getLastMonths', () => {
  const format = (today: Date, count: number) =>
    getLastMonths(today, count).map((p) => `${p.mes}/${p.anio}`);

  it('el 31 de diciembre incluye cada mes del año una sola vez', () => {
    expect(format(d('2026-12-31'), 12)).toEqual([
      '1/2026', '2/2026', '3/2026', '4/2026', '5/2026', '6/2026',
      '7/2026', '8/2026', '9/2026', '10/2026', '11/2026', '12/2026',
    ]);
  });

  it('el 31 de marzo no saltea febrero', () => {
    expect(format(d('2026-03-31'), 3)).toEqual(['1/2026', '2/2026', '3/2026']);
  });

  it('cruza el cambio de año', () => {
    expect(format(d('2026-02-10'), 4)).toEqual(['11/2025', '12/2025', '1/2026', '2/2026']);
  });
});
