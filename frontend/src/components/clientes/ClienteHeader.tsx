import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Edit2, UserCheck, UserX } from 'lucide-react';
import type { Cliente } from '../../types/cliente.types';

interface ClienteHeaderProps {
  cliente: Cliente;
  onEdit: () => void;
  onToggleActivo: () => void;
}

/** Encabezado del detalle: volver, avatar, nombre, estado y acciones. */
export const ClienteHeader: React.FC<ClienteHeaderProps> = ({ cliente, onEdit, onToggleActivo }) => (
  <div>
    <Link
      to="/clientes"
      className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 transition-colors mb-3"
    >
      <ChevronLeft size={16} />
      Clientes
    </Link>

    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-primary-700 text-lg font-bold uppercase shrink-0">
          {cliente.nombre[0]}
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 leading-tight">{cliente.nombre}</h1>
          <span className={`badge mt-1 ${cliente.activo ? 'badge-success' : 'badge-neutral'}`}>
            {cliente.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onEdit} className="btn-secondary text-sm">
          <Edit2 size={14} />
          Editar
        </button>
        <button
          onClick={onToggleActivo}
          className={`text-sm px-3 py-2 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
            cliente.activo
              ? 'border-danger-100 text-danger-600 hover:bg-danger-50 bg-white'
              : 'border-success-100 text-success-600 hover:bg-success-50 bg-white'
          }`}
        >
          {cliente.activo ? (
            <><UserX size={14} />Dar de baja</>
          ) : (
            <><UserCheck size={14} />Reactivar</>
          )}
        </button>
      </div>
    </div>
  </div>
);
