import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { clienteService } from '../services/cliente.service';
import { ClienteModal } from '../components/clientes/ClienteModal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';;
import { PageHeader } from '../components/ui/PageHeader';
import { formatDate } from '../utils/format';
import type { Cliente, ClienteConEstado, ClienteEstado } from '../types/cliente.types';
import {
  Plus,
  Search,
  Users,
  ChevronRight,
  Phone,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

// ─── Tipos ──────────────────────────────────────────────────────────────────

type FilterType = 'activos' | 'inactivos' | 'todos' | 'con_deuda';

// ─── Badge de estado de pago ─────────────────────────────────────────────────

const ESTADO_CONFIG: Record<ClienteEstado, { label: string; className: string }> = {
  AL_DIA:           { label: 'Al día',       className: 'badge-success' },
  COBRAR_HOY:       { label: 'Cobrar hoy',   className: 'badge-danger' },
  PROXIMO_A_VENCER: { label: 'Próximo',      className: 'badge-warning' },
  CON_DEUDA:        { label: 'Con deuda',    className: 'badge-danger' },
};

const EstadoBadge: React.FC<{ estado: ClienteEstado }> = ({ estado }) => {
  const cfg = ESTADO_CONFIG[estado];
  return <span className={`badge ${cfg.className}`}>{cfg.label}</span>;
};

// ─── Página ──────────────────────────────────────────────────────────────────

export const ClientesPage: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('activos');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<Cliente | null>(null);

  // Estado unificado: usamos dos listas según el filtro activo
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesConEstado, setClientesConEstado] = useState<ClienteConEstado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (filter === 'con_deuda' || filter === 'activos') {
        // Siempre cargamos con estado para poder mostrar badges en activos
        const data = await clienteService.getConEstado();
        setClientesConEstado(data);
        setClientes([]);
      } else {
        const activo = filter === 'inactivos' ? false : undefined;
        const data = await clienteService.getAll({ activo });
        setClientes(data);
        setClientesConEstado([]);
      }
    } catch {
      setError('No se pudo cargar la lista de clientes.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrado client-side
  const filteredConEstado = useMemo(() => {
    let list = clientesConEstado;
    if (filter === 'con_deuda') {
      list = list.filter((c) => c.estado === 'CON_DEUDA' || c.estado === 'COBRAR_HOY');
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.nombre.toLowerCase().includes(term) ||
          (c.dni ?? '').includes(term) ||
          (c.telefono ?? '').includes(term)
      );
    }
    return list;
  }, [clientesConEstado, filter, search]);

  const filteredClientes = useMemo(() => {
    if (!search.trim()) return clientes;
    const term = search.toLowerCase();
    return clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(term) ||
        (c.dni ?? '').includes(term) ||
        (c.telefono ?? '').includes(term)
    );
  }, [clientes, search]);

  const useConEstado = filter === 'activos' || filter === 'con_deuda';
  const displayList = useConEstado ? filteredConEstado : filteredClientes;

  const handleToggleActivo = async () => {
    if (!confirmToggle) return;
    setTogglingId(confirmToggle.id);
    try {
      await clienteService.update(confirmToggle.id, { activo: !confirmToggle.activo });
      fetchData();
    } catch {
      // silently handled
    } finally {
      setTogglingId(null);
      setConfirmToggle(null);
    }
  };

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: 'activos',   label: 'Activos' },
    { key: 'con_deuda', label: 'Con deuda' },
    { key: 'inactivos', label: 'Inactivos' },
    { key: 'todos',     label: 'Todos' },
  ];

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle={`${displayList.length} cliente${displayList.length !== 1 ? 's' : ''} encontrado${displayList.length !== 1 ? 's' : ''}`}
        action={
          <button
            id="btn-nuevo-cliente"
            onClick={() => setShowModal(true)}
            className="btn-primary text-sm"
          >
            <Plus size={16} />
            Nuevo cliente
          </button>
        }
      />

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1 shrink-0">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                filter === tab.key
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Search size={16} />
          </div>
          <input
            id="clientes-search"
            type="text"
            placeholder="Buscar por nombre, DNI o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-neutral-400">
            <LoadingSpinner size="lg" />
            <p className="text-sm">Cargando clientes...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="flex items-center gap-2 text-danger-600 bg-danger-50 border border-danger-100 rounded-xl px-5 py-3">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
          <button onClick={fetchData} className="btn-secondary text-sm">
            <RefreshCw size={14} />
            Reintentar
          </button>
        </div>
      ) : displayList.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title={search ? 'Sin resultados' : filter === 'con_deuda' ? 'Sin clientes con deuda' : 'No hay clientes'}
            description={
              search
                ? `No se encontraron clientes para "${search}"`
                : filter === 'con_deuda'
                ? '¡Todos los clientes están al día!'
                : filter === 'activos'
                ? 'Todavía no hay clientes activos. ¡Agrega el primero!'
                : 'No hay clientes con este filtro.'
            }
            action={
              !search && filter === 'activos' ? (
                <button onClick={() => setShowModal(true)} className="btn-primary text-sm">
                  <Plus size={15} />
                  Nuevo cliente
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          {/* Desktop — tabla */}
          <div className="card hidden sm:block overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    DNI
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Alta
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {displayList.map((c) => (
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
                    <td className="px-4 py-3.5 text-neutral-500">
                      {formatDate(c.fechaAlta)}
                    </td>
                    <td className="px-4 py-3.5">
                      {useConEstado && 'estado' in c ? (
                        <EstadoBadge estado={(c as ClienteConEstado).estado} />
                      ) : (
                        <span className={`badge ${c.activo ? 'badge-success' : 'badge-neutral'}`}>
                          {c.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setConfirmToggle(c as Cliente)}
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

          {/* Mobile — cards */}
          <div className="sm:hidden space-y-2">
            {displayList.map((c) => (
              <Link
                key={c.id}
                to={`/clientes/${c.id}`}
                className="card card-hover p-4 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-neutral-800 truncate">
                      {c.nombre}
                    </p>
                    {useConEstado && 'estado' in c ? (
                      <EstadoBadge estado={(c as ClienteConEstado).estado} />
                    ) : (
                      <span className={`badge ${c.activo ? 'badge-success' : 'badge-neutral'}`}>
                        {c.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    )}
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
        </>
      )}

      {/* New client modal */}
      {showModal && (
        <ClienteModal
          onClose={() => setShowModal(false)}
          onSaved={fetchData}
        />
      )}

      {/* Confirmación baja/reactivación */}
      {confirmToggle && (
        <ConfirmModal
          title={confirmToggle.activo ? 'Dar de baja al cliente' : 'Reactivar cliente'}
          message={
            confirmToggle.activo
              ? `¿Estás seguro que querés dar de baja a ${confirmToggle.nombre}? El historial se conservará.`
              : `¿Querés reactivar a ${confirmToggle.nombre}? Volverá a aparecer en el dashboard.`
          }
          confirmLabel={confirmToggle.activo ? 'Sí, dar de baja' : 'Sí, reactivar'}
          variant={confirmToggle.activo ? 'danger' : 'warning'}
          onConfirm={handleToggleActivo}
          onCancel={() => setConfirmToggle(null)}
        />
      )}
    </div>
  );
};
