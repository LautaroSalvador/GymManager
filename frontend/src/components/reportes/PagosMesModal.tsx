import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reporteService, type PagoDelMes } from '../../services/reporte.service';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { formatDate, formatCurrency } from '../../utils/format';
import { X, User, Phone, CreditCard } from 'lucide-react';

interface PagosMesModalProps {
  mes: number;
  anio: number;
  label: string;
  onClose: () => void;
}

export const PagosMesModal: React.FC<PagosMesModalProps> = ({
  mes,
  anio,
  label,
  onClose,
}) => {
  const [pagos, setPagos] = useState<PagoDelMes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await reporteService.getPagosPorMes(anio, mes);
        setPagos(data);
      } catch {
        setError('No se pudo cargar la información del mes.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [mes, anio]);

  const total = pagos.reduce((sum, p) => sum + p.monto, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card w-full max-w-lg flex flex-col" style={{ maxHeight: '85vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
              <CreditCard size={16} className="text-primary-600" />
              Pagos de {label}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              {loading ? '...' : `${pagos.length} cliente${pagos.length !== 1 ? 's' : ''} pagaron`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="md" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-sm text-danger-600">
              {error}
            </div>
          ) : pagos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
              <CreditCard size={32} className="mb-2 opacity-30" />
              <p className="text-sm">Sin pagos registrados en este mes</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white border-b border-neutral-100">
                <tr>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Medio
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {pagos.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        to={`/clientes/${p.cliente.id}`}
                        onClick={onClose}
                        className="font-medium text-neutral-800 hover:text-primary-600 transition-colors flex items-center gap-1.5"
                      >
                        <User size={13} className="text-neutral-400 shrink-0" />
                        {p.cliente.nombre}
                      </Link>
                      {p.cliente.telefono && (
                        <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5 ml-5">
                          <Phone size={10} />
                          {p.cliente.telefono}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-success-700 font-semibold">
                      {formatCurrency(p.monto)}
                    </td>
                    <td className="px-4 py-3">
                      {p.medioPago ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium">
                          {p.medioPago}
                        </span>
                      ) : (
                        <span className="text-neutral-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {formatDate(p.fechaPago)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer con total */}
        {!loading && !error && pagos.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-100 bg-neutral-50">
            <span className="text-sm font-medium text-neutral-600">Total recaudado</span>
            <span className="text-base font-bold text-success-700">{formatCurrency(total)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
