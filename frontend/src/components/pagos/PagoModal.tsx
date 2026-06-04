import React, { useState } from 'react';
import { pagoService } from '../../services/pago.service';
import { getTodayISO, getCurrentPeriod, getMonthName } from '../../utils/format';
import { X, AlertCircle, Banknote, ArrowLeftRight, MoreHorizontal } from 'lucide-react';

interface PagoModalProps {
  clienteId: number;
  clienteNombre: string;
  onClose: () => void;
  onSaved: () => void;
}

// ─── Opciones de medio de pago ─────────────────────────────────────────────

type MedioPagoOpcion = 'Efectivo' | 'Transferencia' | 'Otro';

const MEDIOS: { value: MedioPagoOpcion; label: string; icon: React.ElementType }[] = [
  { value: 'Efectivo',       label: 'Efectivo',       icon: Banknote },
  { value: 'Transferencia',  label: 'Transferencia',  icon: ArrowLeftRight },
  { value: 'Otro',           label: 'Otro',           icon: MoreHorizontal },
];

// ─── Modal ─────────────────────────────────────────────────────────────────

export const PagoModal: React.FC<PagoModalProps> = ({
  clienteId,
  clienteNombre,
  onClose,
  onSaved,
}) => {
  const { mes: currentMes, anio: currentAnio } = getCurrentPeriod();

  const [monto, setMonto] = useState('');
  const [fechaPago, setFechaPago] = useState(getTodayISO());
  const [periodoMes, setPeriodoMes] = useState(currentMes);
  const [periodoAnio, setPeriodoAnio] = useState(currentAnio);
  const [medioPago, setMedioPago] = useState<MedioPagoOpcion>('Efectivo');
  const [otroTexto, setOtroTexto] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const montoNum = parseFloat(monto.replace(',', '.'));
    if (isNaN(montoNum) || montoNum <= 0) {
      setError('El monto debe ser un número mayor a cero.');
      return;
    }

    if (medioPago === 'Otro' && !otroTexto.trim()) {
      setError('Especificá el medio de pago.');
      return;
    }

    const medioPagoFinal = medioPago === 'Otro' ? otroTexto.trim() : medioPago;

    setSubmitting(true);
    try {
      await pagoService.registrar({
        clienteId,
        fechaPago,
        monto: montoNum,
        periodoMes,
        periodoAnio,
        medioPago: medioPagoFinal,
      });
      onSaved();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al registrar el pago';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Build month options: last 3 months + current month + next month
  const monthOptions = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(currentAnio, currentMes - 1 + (i - 3));
    return {
      mes: d.getMonth() + 1,
      anio: d.getFullYear(),
      label: `${getMonthName(d.getMonth() + 1)} ${d.getFullYear()}`,
    };
  });

  const handlePeriodoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [mes, anio] = e.target.value.split('-').map(Number);
    setPeriodoMes(mes);
    setPeriodoAnio(anio);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card w-full max-w-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">Registrar pago</h2>
            <p className="text-xs text-neutral-500 mt-0.5">{clienteNombre}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-danger-50 border border-danger-100 text-danger-600 text-sm mb-4">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Período */}
          <div className="space-y-1.5">
            <label htmlFor="pago-periodo" className="block text-sm font-medium text-neutral-700">
              Período que corresponde
            </label>
            <select
              id="pago-periodo"
              disabled={submitting}
              value={`${periodoMes}-${periodoAnio}`}
              onChange={handlePeriodoChange}
              className="input-base"
            >
              {monthOptions.map((o) => (
                <option key={`${o.mes}-${o.anio}`} value={`${o.mes}-${o.anio}`}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Monto */}
          <div className="space-y-1.5">
            <label htmlFor="pago-monto" className="block text-sm font-medium text-neutral-700">
              Monto <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 text-sm font-medium pointer-events-none">
                $
              </span>
              <input
                id="pago-monto"
                type="number"
                required
                min="0"
                step="any"
                disabled={submitting}
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="15000"
                className="input-base pl-7"
              />
            </div>
          </div>

          {/* Medio de pago */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-700">
              Medio de pago
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MEDIOS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  disabled={submitting}
                  onClick={() => setMedioPago(value)}
                  className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg border text-xs font-medium transition-all ${
                    medioPago === value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            {/* Campo libre cuando se elige "Otro" */}
            {medioPago === 'Otro' && (
              <input
                id="pago-medio-otro"
                type="text"
                placeholder="Ej: Débito, cheque..."
                disabled={submitting}
                value={otroTexto}
                onChange={(e) => setOtroTexto(e.target.value)}
                className="input-base mt-2"
                autoFocus
                maxLength={100}
              />
            )}
          </div>

          {/* Fecha de pago */}
          <div className="space-y-1.5">
            <label htmlFor="pago-fecha" className="block text-sm font-medium text-neutral-700">
              Fecha de pago <span className="text-danger-500">*</span>
            </label>
            <input
              id="pago-fecha"
              type="date"
              required
              disabled={submitting}
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
              className="input-base"
              lang="es-AR"
            />
            <p className="text-xs text-neutral-400">Formato: dd/mm/aaaa</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={submitting} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Guardando...' : 'Registrar pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
