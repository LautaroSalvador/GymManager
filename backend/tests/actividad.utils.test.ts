import { describe, it, expect } from 'vitest';
import { estabaActivoEn, HistorialActividad } from '../src/utils/actividad.utils';

const d = (iso: string) => new Date(`${iso}T00:00:00Z`);

function cliente(overrides: Partial<HistorialActividad>): HistorialActividad {
  return {
    fechaAlta: d('2026-01-10'),
    activo: true,
    fechaBaja: null,
    fechaReactivacion: null,
    ...overrides,
  };
}

describe('estabaActivoEn', () => {
  it('no cuenta antes de la fecha de alta', () => {
    expect(estabaActivoEn(cliente({}), d('2026-01-09'))).toBe(false);
    expect(estabaActivoEn(cliente({}), d('2026-01-10'))).toBe(true);
  });

  it('cuenta hasta la baja y deja de contar desde la baja', () => {
    const c = cliente({ activo: false, fechaBaja: d('2026-04-15') });
    expect(estabaActivoEn(c, d('2026-03-31'))).toBe(true);
    expect(estabaActivoEn(c, d('2026-04-30'))).toBe(false);
  });

  it('vuelve a contar desde la reactivación', () => {
    const c = cliente({ fechaBaja: d('2026-03-05'), fechaReactivacion: d('2026-05-20') });
    expect(estabaActivoEn(c, d('2026-02-28'))).toBe(true);
    expect(estabaActivoEn(c, d('2026-04-30'))).toBe(false);
    expect(estabaActivoEn(c, d('2026-05-31'))).toBe(true);
  });

  it('una reactivación anterior a la última baja no lo vuelve activo', () => {
    const c = cliente({ activo: false, fechaReactivacion: d('2026-02-01'), fechaBaja: d('2026-05-01') });
    expect(estabaActivoEn(c, d('2026-06-30'))).toBe(false);
  });

  it('inactivo sin fecha de baja (dato previo a la migración): nunca cuenta', () => {
    const c = cliente({ activo: false });
    expect(estabaActivoEn(c, d('2026-03-31'))).toBe(false);
  });
});
