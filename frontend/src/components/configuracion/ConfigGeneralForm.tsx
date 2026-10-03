import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { configService } from '../../services/config.service';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { StatusMessage } from './StatusMessage';
import type { FormStatus } from './StatusMessage';

interface ConfigGeneralFormProps {
  precioCuota: number;
  umbralAlertaDias: number;
  onSaved: (precioCuota: number, umbralAlertaDias: number) => void;
}

/** Formulario de precio de cuota y umbral de alerta "próximo a vencer". */
export const ConfigGeneralForm: React.FC<ConfigGeneralFormProps> = ({
  precioCuota,
  umbralAlertaDias,
  onSaved,
}) => {
  const [precio, setPrecio] = useState(precioCuota.toString());
  const [umbral, setUmbral] = useState(umbralAlertaDias.toString());
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<FormStatus | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const precioNum = parseFloat(precio);
    const umbralNum = parseInt(umbral, 10);

    if (isNaN(precioNum) || precioNum <= 0) {
      setStatus({ type: 'error', message: 'El precio de la cuota debe ser un número positivo.' });
      return;
    }
    if (isNaN(umbralNum) || umbralNum < 1 || umbralNum > 30) {
      setStatus({ type: 'error', message: 'El umbral de alerta debe ser entre 1 y 30 días.' });
      return;
    }

    setSaving(true);
    try {
      await configService.update(precioNum, umbralNum);
      onSaved(precioNum, umbralNum);
      setStatus({ type: 'success', message: 'Configuración guardada correctamente.' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar la configuración.';
      setStatus({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="precio-cuota" className="block text-sm font-medium text-neutral-700 mb-1.5">
          Precio de la cuota mensual
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-medium">
            $
          </span>
          <input
            id="precio-cuota"
            type="number"
            min="1"
            step="1"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            disabled={saving}
            className="input-base pl-7"
            placeholder="15000"
          />
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Aplica a nuevos registros. No modifica el historial de pagos existente.
        </p>
      </div>

      <div>
        <label htmlFor="umbral-alerta" className="block text-sm font-medium text-neutral-700 mb-1.5">
          Días de alerta antes del vencimiento
        </label>
        <div className="relative">
          <input
            id="umbral-alerta"
            type="number"
            min="1"
            max="30"
            step="1"
            value={umbral}
            onChange={(e) => setUmbral(e.target.value)}
            disabled={saving}
            className="input-base pr-14"
            placeholder="3"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
            días
          </span>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          Clientes que vencen en los próximos N días aparecen en "Próximos a vencer" del dashboard.
        </p>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {saving ? <LoadingSpinner size="sm" /> : <Save size={15} />}
          Guardar cambios
        </button>
      </div>

      {status && <StatusMessage type={status.type} message={status.message} />}
    </form>
  );
};
