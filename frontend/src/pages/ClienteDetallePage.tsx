import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useClienteDetalle } from '../hooks/useClienteDetalle';
import { clienteService } from '../services/cliente.service';
import { pagoService } from '../services/pago.service';
import { notaService } from '../services/nota.service';
import { ClienteModal } from '../components/clientes/ClienteModal';
import { PagoModal } from '../components/pagos/PagoModal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate, formatCurrency, getMonthName } from '../utils/format';
import {
  ChevronLeft,
  Edit2,
  UserX,
  UserCheck,
  Plus,
  Trash2,
  AlertCircle,
  RefreshCw,
  FileText,
  CreditCard,
  Phone,
  BadgeIcon,
  Calendar,
  Send,
} from 'lucide-react';

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

export const ClienteDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clienteId = parseInt(id ?? '', 10);

  const { cliente, pagos, notas, loading, error, refresh, refreshPagos, refreshNotas, setCliente } =
    useClienteDetalle(clienteId);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [newNota, setNewNota] = useState('');
  const [savingNota, setSavingNota] = useState(false);
  const [deletingPagoId, setDeletingPagoId] = useState<number | null>(null);
  const [deletingNotaId, setDeletingNotaId] = useState<number | null>(null);

  // Modales de confirmación
  const [confirmBaja, setConfirmBaja] = useState(false);
  const [confirmPagoId, setConfirmPagoId] = useState<number | null>(null);
  const [confirmNotaId, setConfirmNotaId] = useState<number | null>(null);

  if (isNaN(clienteId)) {
    navigate('/clientes');
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-neutral-400">
          <LoadingSpinner size="lg" />
          <p className="text-sm">Cargando cliente...</p>
        </div>
      </div>
    );
  }

  if (error || !cliente) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <div className="flex items-center gap-2 text-danger-600 bg-danger-50 border border-danger-100 rounded-xl px-5 py-3">
          <AlertCircle size={16} />
          <span className="text-sm">{error ?? 'Cliente no encontrado'}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={refresh} className="btn-secondary text-sm">
            <RefreshCw size={14} />
            Reintentar
          </button>
          <Link to="/clientes" className="btn-primary text-sm">
            <ChevronLeft size={14} />
            Volver
          </Link>
        </div>
      </div>
    );
  }

  const handleToggleActivo = async () => {
    try {
      const updated = await clienteService.update(cliente.id, { activo: !cliente.activo });
      setCliente(updated);
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

  const handleAddNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNota.trim()) return;
    setSavingNota(true);
    try {
      await notaService.create(cliente.id, newNota.trim());
      setNewNota('');
      refreshNotas();
    } catch {
      // silently handled
    } finally {
      setSavingNota(false);
    }
  };

  const handleDeleteNota = async (notaId: number) => {
    setDeletingNotaId(notaId);
    try {
      await notaService.delete(notaId);
      refreshNotas();
    } catch {
      // silently handled
    } finally {
      setDeletingNotaId(null);
      setConfirmNotaId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Back + header */}
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
            <button
              onClick={() => setShowEditModal(true)}
              className="btn-secondary text-sm"
            >
              <Edit2 size={14} />
              Editar
            </button>
            <button
              onClick={() => setConfirmBaja(true)}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column: datos + pagos */}
        <div className="lg:col-span-2 space-y-5">

          {/* Datos del cliente */}
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
                <dd className="font-medium text-neutral-800">
                  {getVencimientoMesActual(cliente.fechaAlta)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Historial de pagos */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <h2 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                <CreditCard size={15} className="text-neutral-400" />
                Historial de pagos
              </h2>
              {cliente.activo && (
                <button
                  id="btn-registrar-pago"
                  onClick={() => setShowPagoModal(true)}
                  className="btn-primary text-xs py-1.5"
                >
                  <Plus size={13} />
                  Registrar pago
                </button>
              )}
            </div>

            {pagos.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title="Sin pagos registrados"
                description="Cuando el cliente abone, sus pagos aparecerán aquí."
              />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-50">
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Medio
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Fecha de pago
                    </th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {pagos
                    .slice()
                    .sort((a, b) => b.periodoAnio - a.periodoAnio || b.periodoMes - a.periodoMes)
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-50 transition-colors group">
                        <td className="px-5 py-3 font-medium text-neutral-700">
                          {getMonthName(p.periodoMes)} {p.periodoAnio}
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
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setConfirmPagoId(p.id)}
                            disabled={deletingPagoId === p.id}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-neutral-300 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-all"
                            title="Eliminar pago"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right column: notas */}
        <div className="card overflow-hidden flex flex-col" style={{ minHeight: '300px' }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100">
            <FileText size={15} className="text-neutral-400" />
            <h2 className="text-sm font-semibold text-neutral-700">Notas</h2>
          </div>

          {/* Notes list */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-50">
            {notas.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Sin notas"
                description="Agrega observaciones del cliente aquí."
              />
            ) : (
              notas
                .slice()
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((n) => (
                  <div key={n.id} className="px-4 py-3 group hover:bg-neutral-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-neutral-700 leading-relaxed flex-1">{n.texto}</p>
                      <button
                        onClick={() => setConfirmNotaId(n.id)}
                        disabled={deletingNotaId === n.id}
                        className="shrink-0 opacity-0 group-hover:opacity-100 p-1 text-neutral-300 hover:text-danger-500 rounded transition-all"
                        title="Eliminar nota"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      {new Date(n.createdAt).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                ))
            )}
          </div>

          {/* Add note */}
          <form onSubmit={handleAddNota} className="p-3 border-t border-neutral-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={newNota}
                onChange={(e) => setNewNota(e.target.value)}
                placeholder="Agregar nota..."
                disabled={savingNota}
                className="input-base text-sm py-2 flex-1"
              />
              <button
                type="submit"
                disabled={savingNota || !newNota.trim()}
                className="btn-primary py-2 px-3"
                title="Agregar nota"
              >
                <Send size={15} />
              </button>
            </div>
          </form>
        </div>
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
          onClose={() => setShowPagoModal(false)}
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

      {/* Confirmación: eliminar nota */}
      {confirmNotaId !== null && (
        <ConfirmModal
          title="Eliminar nota"
          message="¿Estás seguro que querés eliminar esta nota?"
          confirmLabel="Sí, eliminar"
          variant="danger"
          onConfirm={() => handleDeleteNota(confirmNotaId)}
          onCancel={() => setConfirmNotaId(null)}
        />
      )}
    </div>
  );
};
