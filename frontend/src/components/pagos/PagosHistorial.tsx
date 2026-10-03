import React from 'react';
import { CreditCard, Edit2, Plus, Trash2 } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency, formatDate, getMonthName } from '../../utils/format';
import type { Pago } from '../../types/pago.types';

interface PagosHistorialProps {
  pagos: Pago[];
  /** Solo los clientes activos pueden registrar pagos. */
  puedeRegistrar: boolean;
  deletingPagoId: number | null;
  onRegistrar: () => void;
  onEditar: (pago: Pago) => void;
  onEliminar: (pagoId: number) => void;
}

const COLUMNAS = ['Período', 'Monto', 'Medio', 'Fecha de pago'];

export const PagosHistorial: React.FC<PagosHistorialProps> = ({
  pagos,
  puedeRegistrar,
  deletingPagoId,
  onRegistrar,
  onEditar,
  onEliminar,
}) => {
  const pagosOrdenados = pagos
    .slice()
    .sort((a, b) => b.periodoAnio - a.periodoAnio || b.periodoMes - a.periodoMes);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <h2 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
          <CreditCard size={15} className="text-neutral-400" />
          Historial de pagos
        </h2>
        {puedeRegistrar && (
          <button id="btn-registrar-pago" onClick={onRegistrar} className="btn-primary text-xs py-1.5">
            <Plus size={13} />
            Registrar pago
          </button>
        )}
      </div>

      {pagos.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Sin pagos registrados"
          description="Cuando el cliente abone, sus pagos aparecerán aquí."
        />
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-50">
              {COLUMNAS.map((columna, i) => (
                <th
                  key={columna}
                  className={`text-left ${i === 0 ? 'px-5' : 'px-4'} py-2.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider`}
                >
                  {columna}
                </th>
              ))}
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {pagosOrdenados.map((p) => (
              <tr key={p.id} className="hover:bg-neutral-50 transition-colors group">
                <td className="px-5 py-3 font-medium text-neutral-700">
                  {getMonthName(p.periodoMes)} {p.periodoAnio}
                </td>
                <td className="px-4 py-3 text-success-700 font-semibold">{formatCurrency(p.monto)}</td>
                <td className="px-4 py-3">
                  {p.medioPago ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium">
                      {p.medioPago}
                    </span>
                  ) : (
                    <span className="text-neutral-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-500">{formatDate(p.fechaPago)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => onEditar(p)}
                      className="p-1.5 text-neutral-300 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all"
                      title="Editar pago"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onEliminar(p.id)}
                      disabled={deletingPagoId === p.id}
                      className="p-1.5 text-neutral-300 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-all"
                      title="Eliminar pago"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
