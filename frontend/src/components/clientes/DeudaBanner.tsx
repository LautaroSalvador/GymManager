import React from 'react';
import { AlertCircle } from 'lucide-react';
import { formatPeriodos } from '../../utils/format';
import type { Periodo } from '../../types/cliente.types';

/** Aviso con los meses vencidos que el cliente no pagó. No muestra nada si no debe. */
export const DeudaBanner: React.FC<{ mesesAdeudados: Periodo[] }> = ({ mesesAdeudados }) => {
  if (mesesAdeudados.length === 0) return null;

  return (
    <div className="flex items-start gap-2.5 p-4 rounded-xl bg-danger-50 border border-danger-100 text-danger-700 text-sm">
      <AlertCircle size={16} className="shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold">
          Debe {mesesAdeudados.length} {mesesAdeudados.length === 1 ? 'mes' : 'meses'}
        </p>
        <p className="text-danger-600">{formatPeriodos(mesesAdeudados)}</p>
      </div>
    </div>
  );
};
