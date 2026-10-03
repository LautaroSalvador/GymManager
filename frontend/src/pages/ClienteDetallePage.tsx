import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useClienteDetalle } from '../hooks/useClienteDetalle';
import { clienteService } from '../services/cliente.service';
import { pagoService } from '../services/pago.service';
import { ClienteModal } from '../components/clientes/ClienteModal';
import { ClienteHeader } from '../components/clientes/ClienteHeader';
import { ClienteDatosCard } from '../components/clientes/ClienteDatosCard';
import { DeudaBanner } from '../components/clientes/DeudaBanner';
import { PagosHistorial } from '../components/pagos/PagosHistorial';
import { PagoModal } from '../components/pagos/PagoModal';
import { PagoEditModal } from '../components/pagos/PagoEditModal';
import { NotasPanel } from '../components/notas/NotasPanel';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { PageLoading } from '../components/ui/PageLoading';
import { PageError } from '../components/ui/PageError';
import type { Pago } from '../types/pago.types';
import { ChevronLeft } from 'lucide-react';

export const ClienteDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const clienteId = parseInt(id ?? '', 10);

  const { cliente, pagos, notas, loading, error, refresh, refreshPagos, refreshNotas, refreshCliente } =
    useClienteDetalle(clienteId);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [editingPago, setEditingPago] = useState<Pago | null>(null);
  const [deletingPagoId, setDeletingPagoId] = useState<number | null>(null);

  // Modales de confirmación
  const [confirmBaja, setConfirmBaja] = useState(false);
  const [confirmPagoId, setConfirmPagoId] = useState<number | null>(null);

  if (isNaN(clienteId)) {
    return <Navigate to="/clientes" replace />;
  }

  if (loading) {
    return <PageLoading message="Cargando cliente..." />;
  }

  if (error || !cliente) {
    return (
      <PageError message={error ?? 'Cliente no encontrado'} onRetry={refresh}>
        <Link to="/clientes" className="btn-primary text-sm">
          <ChevronLeft size={14} />
          Volver
        </Link>
      </PageError>
    );
  }

  const handleToggleActivo = async () => {
    try {
      await clienteService.update(cliente.id, { activo: !cliente.activo });
      // Se recarga el cliente completo: al reactivarlo cambia su estado de deuda.
      refreshCliente();
    } catch {
      // silently handled — modal already closed
    } finally {
      setConfirmBaja(false);
    }
  };

  const handleDeletePago = async (pagoId: number) => {
    setDeletingPagoId(pagoId);
    try {
      await pagoService.delete(pagoId);
      refreshPagos();
    } catch {
      // silently handled
    } finally {
      setDeletingPagoId(null);
      setConfirmPagoId(null);
    }
  };

  return (
    <div className="space-y-5">
      <ClienteHeader
        cliente={cliente}
        onEdit={() => setShowEditModal(true)}
        onToggleActivo={() => setConfirmBaja(true)}
      />

      <DeudaBanner mesesAdeudados={cliente.mesesAdeudados ?? []} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column: datos + pagos */}
        <div className="lg:col-span-2 space-y-5">
          <ClienteDatosCard cliente={cliente} />
          <PagosHistorial
            pagos={pagos}
            puedeRegistrar={cliente.activo}
            deletingPagoId={deletingPagoId}
            onRegistrar={() => setShowPagoModal(true)}
            onEditar={setEditingPago}
            onEliminar={setConfirmPagoId}
          />
        </div>

        {/* Right column: notas */}
        <NotasPanel clienteId={cliente.id} notas={notas} onChanged={refreshNotas} />
      </div>

      {/* Modals */}
      {showEditModal && (
        <ClienteModal
          cliente={cliente}
          onClose={() => setShowEditModal(false)}
          onSaved={refresh}
        />
      )}

      {showPagoModal && (
        <PagoModal
          clienteId={cliente.id}
          clienteNombre={cliente.nombre}
          mesesAdeudados={cliente.mesesAdeudados ?? []}
          onClose={() => setShowPagoModal(false)}
          onSaved={refreshPagos}
        />
      )}

      {editingPago && (
        <PagoEditModal
          pago={editingPago}
          clienteNombre={cliente.nombre}
          onClose={() => setEditingPago(null)}
          onSaved={refreshPagos}
        />
      )}

      {/* Confirmación: dar de baja / reactivar */}
      {confirmBaja && (
        <ConfirmModal
          title={cliente.activo ? 'Dar de baja al cliente' : 'Reactivar cliente'}
          message={
            cliente.activo
              ? `¿Estás seguro que querés dar de baja a ${cliente.nombre}? El historial de pagos y notas se conservará.`
              : `¿Querés reactivar a ${cliente.nombre}? Volverá a aparecer en el dashboard.`
          }
          confirmLabel={cliente.activo ? 'Sí, dar de baja' : 'Sí, reactivar'}
          variant={cliente.activo ? 'danger' : 'warning'}
          onConfirm={handleToggleActivo}
          onCancel={() => setConfirmBaja(false)}
        />
      )}

      {/* Confirmación: eliminar pago */}
      {confirmPagoId !== null && (
        <ConfirmModal
          title="Eliminar pago"
          message="¿Estás seguro que querés eliminar este pago? Esta acción no se puede deshacer."
          confirmLabel="Sí, eliminar"
          variant="danger"
          onConfirm={() => handleDeletePago(confirmPagoId)}
          onCancel={() => setConfirmPagoId(null)}
        />
      )}
    </div>
  );
};
