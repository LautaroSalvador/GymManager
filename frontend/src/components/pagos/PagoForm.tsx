import React, { useState } from 'react';
import { FormError } from '../ui/Modal';
import { MedioPagoSelector } from './MedioPagoSelector';
import type { MedioPagoValue } from './MedioPagoSelector';
import { getMonthName } from '../../utils/format';
import type { Periodo } from '../../types/cliente.types';

export interface PagoFormValues {
  periodo: Periodo;
  monto: string;
  medioPago: MedioPagoValue;
  fechaPago: string; // YYYY-MM-DD
}

export interface PagoFormSubmit {
  periodoMes: number;
  periodoAnio: number;
  monto: number;
  medioPago: string;
  fechaPago: string;
}

interface PagoFormProps {
  /** Prefijo para los ids de los inputs (permite tener dos formularios distintos). */
  idPrefix: string;
  initialValues: PagoFormValues;
  periodOptions: Periodo[];
  submitLabel: string;
  onSubmit: (values: PagoFormSubmit) => Promise<void>;
  onCancel: () => void;
}

const periodoKey = (p: Periodo) => `${p.mes}-${p.anio}`;

/** Formulario de pago compartido por "Registrar pago" y "Editar pago". */
export const PagoForm: React.FC<PagoFormProps> = ({
  idPrefix,
  initialValues,
  periodOptions,
  submitLabel,
  onSubmit,
  onCancel,
}) => {
  const [values, setValues] = useState<PagoFormValues>(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePeriodoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [mes, anio] = e.target.value.split('-').map(Number);
    setValues((prev) => ({ ...prev, periodo: { mes, anio } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const montoNum = parseFloat(values.monto.replace(',', '.'));
    if (isNaN(montoNum) || montoNum <= 0) {
      setError('El monto debe ser un número mayor a cero.');
      return;
    }

    const { medio, otro } = values.medioPago;
    if (medio === 'Otro' && !otro.trim()) {
      setError('Especificá el medio de pago.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        periodoMes: values.periodo.mes,
        periodoAnio: values.periodo.anio,
        monto: montoNum,
        medioPago: medio === 'Otro' ? otro.trim() : medio,
        fechaPago: values.fechaPago,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el pago');
      setSubmitting(false);
    }
  };

  return (
    <>
      {error && <FormError message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Período */}
        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-periodo`} className="block text-sm font-medium text-neutral-700">
            Período que corresponde
          </label>
          <select
            id={`${idPrefix}-periodo`}
            disabled={submitting}
            value={periodoKey(values.periodo)}
            onChange={handlePeriodoChange}
            className="input-base"
          >
            {periodOptions.map((p) => (
              <option key={periodoKey(p)} value={periodoKey(p)}>
                {getMonthName(p.mes)} {p.anio}
              </option>
            ))}
          </select>
        </div>

        {/* Monto */}
        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-monto`} className="block text-sm font-medium text-neutral-700">
            Monto <span className="text-danger-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 text-sm font-medium pointer-events-none">
              $
            </span>
            <input
              id={`${idPrefix}-monto`}
              type="number"
              required
              min="0"
              step="any"
              disabled={submitting}
              value={values.monto}
              onChange={(e) => setValues((prev) => ({ ...prev, monto: e.target.value }))}
              placeholder="15000"
              className="input-base pl-7"
            />
          </div>
        </div>

        <MedioPagoSelector
          id={`${idPrefix}-medio-otro`}
          value={values.medioPago}
          onChange={(medioPago) => setValues((prev) => ({ ...prev, medioPago }))}
          disabled={submitting}
        />

        {/* Fecha de pago */}
        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-fecha`} className="block text-sm font-medium text-neutral-700">
            Fecha de pago <span className="text-danger-500">*</span>
          </label>
          <input
            id={`${idPrefix}-fecha`}
            type="date"
            required
            disabled={submitting}
            value={values.fechaPago}
            onChange={(e) => setValues((prev) => ({ ...prev, fechaPago: e.target.value }))}
            className="input-base"
            lang="es-AR"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel} disabled={submitting} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? 'Guardando...' : submitLabel}
          </button>
        </div>
      </form>
    </>
  );
};
