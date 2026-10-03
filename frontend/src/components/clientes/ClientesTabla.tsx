import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Phone } from 'lucide-react';
import { EstadoBadge } from './EstadoBadge';
import { formatDate } from '../../utils/format';
import type { ClienteListItem } from '../../types/cliente.types';

interface ClientesTablaProps {
  clientes: ClienteListItem[];
  togglingId: number | null;
  onToggleActivo: (cliente: ClienteListItem) => void;
}

const COLUMNAS = ['Nombre', 'DNI', 'Teléfono', 'Alta', 'Estado'];

/** Listado de clientes en formato tabla (desktop). */
export const ClientesTabla: React.FC<ClientesTablaProps> = ({ clientes, togglingId, onToggleActivo }) => (
  <div className="card hidden sm:block overflow-hidden">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-neutral-100">
          {COLUMNAS.map((columna, i) => (
            <th
              key={columna}
              className={`text-left ${i === 0 ? 'px-5' : 'px-4'} py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider`}
            >
              {columna}
            </th>
          ))}
          <th className="px-4 py-3" />
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-50">
        {clientes.map((c) => (
          <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
            <td className="px-5 py-3.5">
              <Link
                to={`/clientes/${c.id}`}
                className="font-medium text-neutral-800 hover:text-primary-600 transition-colors"
              >
                {c.nombre}
              </Link>
            </td>
            <td className="px-4 py-3.5 text-neutral-500">
              {c.dni ?? <span className="text-neutral-300">—</span>}
            </td>
            <td className="px-4 py-3.5 text-neutral-500">
              {c.telefono ? (
                <a
                  href={`tel:${c.telefono}`}
                  className="flex items-center gap-1.5 hover:text-primary-600 transition-colors"
                >
                  <Phone size={13} />
                  {c.telefono}
                </a>
              ) : (
                <span className="text-neutral-300">—</span>
              )}
            </td>
            <td className="px-4 py-3.5 text-neutral-500">{formatDate(c.fechaAlta)}</td>
            <td className="px-4 py-3.5">
              <EstadoBadge cliente={c} />
            </td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleActivo(c)}
                  disabled={togglingId === c.id}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                    c.activo
                      ? 'border-danger-100 text-danger-600 hover:bg-danger-50'
                      : 'border-success-100 text-success-600 hover:bg-success-50'
                  }`}
                >
                  {togglingId === c.id ? '...' : c.activo ? 'Dar de baja' : 'Reactivar'}
                </button>
                <Link
                  to={`/clientes/${c.id}`}
                  className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <ChevronRight size={16} />
                </Link>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
