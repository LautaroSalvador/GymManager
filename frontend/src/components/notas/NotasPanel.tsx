import React, { useState } from 'react';
import { FileText, Send, Trash2 } from 'lucide-react';
import { notaService } from '../../services/nota.service';
import { ConfirmModal } from '../ui/ConfirmModal';
import { EmptyState } from '../ui/EmptyState';
import type { Nota } from '../../types/cliente.types';

interface NotasPanelProps {
  clienteId: number;
  notas: Nota[];
  /** Se llama después de agregar o borrar una nota para recargar la lista. */
  onChanged: () => void;
}

/** Lista de notas del cliente con formulario para agregar y opción de borrar. */
export const NotasPanel: React.FC<NotasPanelProps> = ({ clienteId, notas, onChanged }) => {
  const [newNota, setNewNota] = useState('');
  const [savingNota, setSavingNota] = useState(false);
  const [deletingNotaId, setDeletingNotaId] = useState<number | null>(null);
  const [confirmNotaId, setConfirmNotaId] = useState<number | null>(null);

  const notasOrdenadas = notas
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleAddNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNota.trim()) return;
    setSavingNota(true);
    try {
      await notaService.create(clienteId, newNota.trim());
      setNewNota('');
      onChanged();
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
      onChanged();
    } catch {
      // silently handled
    } finally {
      setDeletingNotaId(null);
      setConfirmNotaId(null);
    }
  };

  return (
    <div className="card overflow-hidden flex flex-col" style={{ minHeight: '300px' }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100">
        <FileText size={15} className="text-neutral-400" />
        <h2 className="text-sm font-semibold text-neutral-700">Notas</h2>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-50">
        {notas.length === 0 ? (
          <EmptyState icon={FileText} title="Sin notas" description="Agrega observaciones del cliente aquí." />
        ) : (
          notasOrdenadas.map((n) => (
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
            maxLength={1000}
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
