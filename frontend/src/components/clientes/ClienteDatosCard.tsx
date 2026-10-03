import React from 'react';
import { BadgeIcon, Calendar, Phone } from 'lucide-react';
import { formatDate } from '../../utils/format';
import type { Cliente } from '../../types/cliente.types';

/**
 * Calcula la fecha de vencimiento del mes actual para un cliente.
 * Vencimiento = mismo día del mes de alta (igual que el backend).
 * Si ese día no existe en el mes actual, se usa el último día del mes.
 */
function getVencimientoMesActual(fechaAlta: string): string {
  // Usamos new Date() directamente — soporta tanto "2026-01-01" como "2026-01-01T00:00:00.000Z"
  const alta = new Date(fechaAlta);
  const altaDay = alta.getUTCDate();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-indexed
  const lastDay = new Date(year, month, 0).getDate();
  const venceDay = Math.min(altaDay, lastDay);
  const date = new Date(year, month - 1, venceDay);
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
  });
}

export const ClienteDatosCard: React.FC<{ cliente: Cliente }> = ({ cliente }) => (
  <div className="card p-5">
    <h2 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2">
      <BadgeIcon size={15} className="text-neutral-400" />
      Datos del cliente
    </h2>
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
      <div>
        <dt className="text-neutral-400 mb-0.5">DNI</dt>
        <dd className="font-medium text-neutral-800">{cliente.dni ?? '—'}</dd>
      </div>
      <div>
        <dt className="text-neutral-400 mb-0.5 flex items-center gap-1">
          <Phone size={12} /> Teléfono
        </dt>
        <dd className="font-medium text-neutral-800">
          {cliente.telefono ? (
            <a href={`tel:${cliente.telefono}`} className="hover:text-primary-600 transition-colors">
              {cliente.telefono}
            </a>
          ) : '—'}
        </dd>
      </div>
      <div>
        <dt className="text-neutral-400 mb-0.5 flex items-center gap-1">
          <Calendar size={12} /> Fecha de alta
        </dt>
        <dd className="font-medium text-neutral-800">{formatDate(cliente.fechaAlta)}</dd>
      </div>
      <div>
        <dt className="text-neutral-400 mb-0.5">Próximo vencimiento</dt>
        <dd className="font-medium text-neutral-800">{getVencimientoMesActual(cliente.fechaAlta)}</dd>
      </div>
      {!cliente.activo && cliente.fechaBaja && (
        <div>
          <dt className="text-neutral-400 mb-0.5">Fecha de baja</dt>
          <dd className="font-medium text-neutral-800">{formatDate(cliente.fechaBaja)}</dd>
        </div>
      )}
      {(cliente.calle || cliente.altura) && (
        <div className="sm:col-span-2">
          <dt className="text-neutral-400 mb-0.5">Dirección</dt>
          <dd className="font-medium text-neutral-800">
            {[cliente.calle, cliente.altura].filter(Boolean).join(' ')}
          </dd>
        </div>
      )}
    </dl>
  </div>
);
