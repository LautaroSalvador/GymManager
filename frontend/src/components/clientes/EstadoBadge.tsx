import React from 'react';
import { tieneEstado } from '../../types/cliente.types';
import type { ClienteEstado, ClienteListItem } from '../../types/cliente.types';

const ESTADO_CONFIG: Record<ClienteEstado, { label: string; className: string }> = {
  AL_DIA:           { label: 'Al día',       className: 'badge-success' },
  COBRAR_HOY:       { label: 'Cobrar hoy',   className: 'badge-danger' },
  PROXIMO_A_VENCER: { label: 'Próximo',      className: 'badge-warning' },
  CON_DEUDA:        { label: 'Con deuda',    className: 'badge-danger' },
};

/**
 * Badge del listado: si el cliente viene con estado de pago muestra ese estado
 * (y cuántos meses debe); si no, solo si está activo o inactivo.
 */
export const EstadoBadge: React.FC<{ cliente: ClienteListItem }> = ({ cliente }) => {
  if (!tieneEstado(cliente)) {
    return (
      <span className={`badge ${cliente.activo ? 'badge-success' : 'badge-neutral'}`}>
        {cliente.activo ? 'Activo' : 'Inactivo'}
      </span>
    );
  }

  const cfg = ESTADO_CONFIG[cliente.estado];
  const meses = cliente.mesesAdeudados.length;
  const label = cliente.estado === 'CON_DEUDA' && meses > 1 ? `${cfg.label} (${meses} meses)` : cfg.label;
  return <span className={`badge ${cfg.className}`}>{label}</span>;
};
