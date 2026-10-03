import React, { useState, useMemo, useCallback } from 'react';
import { clienteService } from '../services/cliente.service';
import { ClienteModal } from '../components/clientes/ClienteModal';
import { ClientesFiltros } from '../components/clientes/ClientesFiltros';
import type { FiltroClientes } from '../components/clientes/ClientesFiltros';
import { ClientesTabla } from '../components/clientes/ClientesTabla';
import { ClientesListaMobile } from '../components/clientes/ClientesListaMobile';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { PageLoading } from '../components/ui/PageLoading';
import { PageError } from '../components/ui/PageError';
import { useApiData } from '../hooks/useApiData';
import { tieneEstado } from '../types/cliente.types';
import type { ClienteListItem } from '../types/cliente.types';
import { Plus, Users } from 'lucide-react';

function getEmptyStateText(filter: FiltroClientes, search: string): { title: string; description: string } {
  if (search) {
    return { title: 'Sin resultados', description: `No se encontraron clientes para "${search}"` };
  }
  if (filter === 'con_deuda') {
    return { title: 'Sin clientes con deuda', description: '¡Todos los clientes están al día!' };
  }
  if (filter === 'activos') {
    return { title: 'No hay clientes', description: 'Todavía no hay clientes activos. ¡Agrega el primero!' };
  }
  return { title: 'No hay clientes', description: 'No hay clientes con este filtro.' };
}

export const ClientesPage: React.FC = () => {
  const [filter, setFilter] = useState<FiltroClientes>('activos');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<ClienteListItem | null>(null);

  // Activos y "con deuda" se cargan con estado de pago para mostrar badges.
  const fetchClientes = useCallback((): Promise<ClienteListItem[]> => {
    if (filter === 'activos' || filter === 'con_deuda') {
      return clienteService.getConEstado();
    }
    return clienteService.getAll({ activo: filter === 'inactivos' ? false : undefined });
  }, [filter]);

  const { data, loading, error, refresh } = useApiData(
    fetchClientes,
    'No se pudo cargar la lista de clientes.'
  );

  // Filtrado client-side
  const displayList = useMemo(() => {
    let list = data ?? [];
    if (filter === 'con_deuda') {
      list = list.filter(
        (c) => tieneEstado(c) && (c.estado === 'CON_DEUDA' || c.estado === 'COBRAR_HOY')
      );
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
  }, [data, filter, search]);

  const handleToggleActivo = async () => {
    if (!confirmToggle) return;
    setTogglingId(confirmToggle.id);
    try {
      await clienteService.update(confirmToggle.id, { activo: !confirmToggle.activo });
      refresh();
    } catch {
      // silently handled
    } finally {
      setTogglingId(null);
      setConfirmToggle(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <PageLoading message="Cargando clientes..." />;
    }
    if (error) {
      return <PageError message={error} onRetry={refresh} />;
    }
    if (displayList.length === 0) {
      const { title, description } = getEmptyStateText(filter, search);
      return (
        <div className="card">
          <EmptyState
            icon={Users}
            title={title}
            description={description}
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
      );
    }
    return (
      <>
        <ClientesTabla
          clientes={displayList}
          togglingId={togglingId}
          onToggleActivo={setConfirmToggle}
        />
        <ClientesListaMobile clientes={displayList} />
      </>
    );
  };

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

      <ClientesFiltros
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
      />

      {renderContent()}

      {/* New client modal */}
      {showModal && (
        <ClienteModal
          onClose={() => setShowModal(false)}
          onSaved={refresh}
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
