import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Phone } from 'lucide-react';
import { EstadoBadge } from './EstadoBadge';
import { formatDate } from '../../utils/format';
import type { ClienteListItem } from '../../types/cliente.types';

/** Listado de clientes en formato tarjetas (mobile). */
export const ClientesListaMobile: React.FC<{ clientes: ClienteListItem[] }> = ({ clientes }) => (
  <div className="sm:hidden space-y-2">
    {clientes.map((c) => (
      <Link
        key={c.id}
        to={`/clientes/${c.id}`}
        className="card card-hover p-4 flex items-center justify-between"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-neutral-800 truncate">{c.nombre}</p>
            <EstadoBadge cliente={c} />
          </div>
          <p className="text-xs text-neutral-400">Alta: {formatDate(c.fechaAlta)}</p>
          {c.telefono && (
            <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
              <Phone size={11} />
              {c.telefono}
            </p>
          )}
        </div>
        <ChevronRight size={18} className="text-neutral-300 shrink-0" />
      </Link>
    ))}
  </div>
);
