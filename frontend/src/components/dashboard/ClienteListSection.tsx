import React from 'react';
import { Link } from 'react-router-dom';
import type { DashboardCliente } from '../../types/dashboard.types';
import { formatDate } from '../../utils/format';
import { EmptyState } from '../ui/EmptyState';
import { Users, Phone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ClienteListSectionProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  clients: DashboardCliente[];
  emptyMessage: string;
  badgeClass: string;
  badgeLabel: string;
}

export const ClienteListSection: React.FC<ClienteListSectionProps> = ({
  title,
  icon: Icon,
  iconColor,
  iconBg,
  clients,
  emptyMessage,
  badgeClass,
  // badgeLabel no se usa en el JSX (se muestra el count en su lugar)
}) => (
  <div className="card overflow-hidden">
    {/* Header */}
    <div className={`flex items-center justify-between px-4 py-3 border-b border-neutral-100`}>
      <div className="flex items-center gap-2">
        <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${iconBg}`}>
          <Icon size={15} className={iconColor} />
        </div>
        <h2 className="text-sm font-semibold text-neutral-800">{title}</h2>
      </div>
      {clients.length > 0 && (
        <span className={`badge ${badgeClass}`}>{clients.length}</span>
      )}
    </div>

    {/* List */}
    {clients.length === 0 ? (
      <EmptyState
        icon={Users}
        title={emptyMessage}
      />
    ) : (
      <ul className="divide-y divide-neutral-50">
        {clients.map((c) => (
          <li key={c.id}>
            <Link
              to={`/clientes/${c.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-800 group-hover:text-primary-600 transition-colors truncate">
                  {c.nombre}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Vence: {formatDate(c.fechaVencimiento)}
                </p>
              </div>
              {c.telefono && (
                <a
                  href={`tel:${c.telefono}`}
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 ml-2 p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title={c.telefono}
                >
                  <Phone size={14} />
                </a>
              )}
            </Link>
          </li>
        ))}
      </ul>
    )}
  </div>
);
